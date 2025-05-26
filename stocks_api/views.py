from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import yfinance as yf
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
import pandas as pd

from .models import Stock, PriceHistory, Watchlist
from .serializers import StockSerializer, StockDetailSerializer, WatchlistSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StockDetailSerializer
        return StockSerializer
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '').upper()
        if not query:
            return Response({"error": "Query parameter 'q' is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use yfinance to search for stocks
            tickers = yf.Tickers(query)
            results = []
            
            # If the exact ticker exists, add it first
            if query in tickers.tickers:
                ticker_info = tickers.tickers[query].info
                if 'shortName' in ticker_info:
                    results.append({
                        "symbol": query,
                        "name": ticker_info.get('shortName', ticker_info.get('longName', query)),
                        "price": ticker_info.get('regularMarketPrice', None)
                    })
            
            # Try to find related tickers (simple implementation)
            related_symbols = [f"{query}.X", f"{query}-USD", f"{query}.DE"]
            for symbol in related_symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    if 'shortName' in info:
                        results.append({
                            "symbol": symbol,
                            "name": info.get('shortName', info.get('longName', symbol)),
                            "price": info.get('regularMarketPrice', None)
                        })
                except:
                    continue
            
            # For each result, create or update the stock in our database
            stocks = []
            for item in results:
                stock, created = Stock.objects.update_or_create(
                    symbol=item["symbol"],
                    defaults={
                        "name": item["name"],
                        "last_price": item["price"] if item["price"] else None
                    }
                )
                stocks.append(stock)
            
            # If no results found via direct lookup, try a more general search
            if not stocks:
                # This is a simplified approach - in a real app, you might use a more sophisticated search
                # like Yahoo Finance's search API or a market data provider's search endpoint
                possible_symbols = [f"{query}", f"{query}.X", f"{query}-USD"]
                for symbol in possible_symbols:
                    try:
                        ticker = yf.Ticker(symbol)
                        info = ticker.info
                        if 'shortName' in info:
                            stock, created = Stock.objects.update_or_create(
                                symbol=symbol,
                                defaults={
                                    "name": info.get('shortName', info.get('longName', symbol)),
                                    "last_price": info.get('regularMarketPrice', None)
                                }
                            )
                            stocks.append(stock)
                    except:
                        continue
            
            serializer = self.get_serializer(stocks, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        try:
            stock = self.get_object()
            
            # Fetch the latest data from Yahoo Finance
            ticker = yf.Ticker(stock.symbol)
            info = ticker.info
            
            # Update stock information
            stock.name = info.get('shortName', info.get('longName', stock.name))
            stock.last_price = info.get('regularMarketPrice', stock.last_price)
            stock.save()
            
            # Fetch and store historical data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            # Fetch historical data
            history = ticker.history(start=start_date, end=end_date)
            
            # Clear existing price history and add new data
            PriceHistory.objects.filter(stock=stock).delete()
            
            for index, row in history.iterrows():
                PriceHistory.objects.create(
                    stock=stock,
                    date=index.date(),
                    open_price=row['Open'],
                    high_price=row['High'],
                    low_price=row['Low'],
                    close_price=row['Close'],
                    volume=row['Volume']
                )
            
            # Create additional data for the response
            response_data = StockDetailSerializer(stock).data
            
            # Add additional stock info
            additional_info = {
                'marketCap': info.get('marketCap', None),
                'peRatio': info.get('trailingPE', None),
                'dayHigh': info.get('dayHigh', None),
                'dayLow': info.get('dayLow', None),
                'volume': info.get('volume', None),
                'avgVolume': info.get('averageVolume', None),
                'yearHigh': info.get('fiftyTwoWeekHigh', None),
                'yearLow': info.get('fiftyTwoWeekLow', None),
                'dividendYield': info.get('dividendYield', None),
                'sector': info.get('sector', None),
                'industry': info.get('industry', None),
                'priceChange': info.get('regularMarketChange', None),
                'percentChange': info.get('regularMarketChangePercent', None),
            }
            
            response_data.update(additional_info)
            
            return Response(response_data)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def predict_price(self, request, pk=None):
        try:
            stock = self.get_object()
            
            # Get historical data for the last 60 days
            end_date = datetime.now()
            start_date = end_date - timedelta(days=60)
            
            # Fetch historical data
            history = PriceHistory.objects.filter(
                stock=stock,
                date__range=[start_date, end_date]
            ).order_by('date')
            
            if len(history) < 30:
                return Response(
                    {"error": "Insufficient historical data for prediction"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prepare data for prediction
            df = pd.DataFrame(list(history.values()))
            
            # Create features
            df['MA5'] = df['close_price'].rolling(window=5).mean()
            df['MA20'] = df['close_price'].rolling(window=20).mean()
            df['Volume_MA5'] = df['volume'].rolling(window=5).mean()
            df['Price_Change'] = df['close_price'].pct_change()
            
            # Drop rows with NaN values
            df = df.dropna()
            
            # Prepare features and target
            features = ['open_price', 'high_price', 'low_price', 'volume', 'MA5', 'MA20', 'Volume_MA5', 'Price_Change']
            X = df[features]
            y = df['close_price']
            
            # Scale the features
            scaler = MinMaxScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Split the data
            X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
            
            # Train the model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Calculate accuracy
            accuracy = model.score(X_test, y_test)
            
            # Prepare data for next day prediction
            last_data = X_scaled[-1].reshape(1, -1)
            predicted_price = model.predict(last_data)[0]
            
            # Update stock with prediction
            stock.predicted_price = predicted_price
            stock.prediction_date = timezone.now()
            stock.model_accuracy = accuracy
            stock.save()
            
            return Response({
                'symbol': stock.symbol,
                'predicted_price': predicted_price,
                'prediction_date': stock.prediction_date,
                'model_accuracy': accuracy
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    
    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        watchlist = self.get_object()
        stock_id = request.data.get('stock_id')
        
        try:
            stock = Stock.objects.get(pk=stock_id)
            watchlist.stocks.add(stock)
            return Response({'status': 'stock added to watchlist'})
        except Stock.DoesNotExist:
            return Response(
                {'error': 'Stock not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_stock(self, request, pk=None):
        watchlist = self.get_object()
        stock_id = request.data.get('stock_id')
        
        try:
            stock = Stock.objects.get(pk=stock_id)
            watchlist.stocks.remove(stock)
            return Response({'status': 'stock removed from watchlist'})
        except Stock.DoesNotExist:
            return Response(
                {'error': 'Stock not found'},
                status=status.HTTP_404_NOT_FOUND
            )