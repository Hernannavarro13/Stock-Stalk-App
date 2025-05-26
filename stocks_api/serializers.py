from rest_framework import serializers
from .models import Stock, PriceHistory, Watchlist

class PriceHistorySerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m-%d")
    
    class Meta:
        model = PriceHistory
        fields = ['date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'last_price', 'predicted_price', 'prediction_date', 'model_accuracy']

class StockDetailSerializer(serializers.ModelSerializer):
    price_history = PriceHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'last_price', 'predicted_price', 'prediction_date', 
                 'model_accuracy', 'price_history', 'updated_at']

class WatchlistSerializer(serializers.ModelSerializer):
    stocks = StockSerializer(many=True, read_only=True)
    
    class Meta:
        model = Watchlist
        fields = ['id', 'name', 'stocks', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        watchlist = Watchlist.objects.create(user=user, **validated_data)
        return watchlist