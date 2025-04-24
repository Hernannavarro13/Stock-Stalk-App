from rest_framework import serializers
from .models import Stock, PriceHistory

class PriceHistorySerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m-%d")
    
    class Meta:
        model = PriceHistory
        fields = ['date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'last_price', 'updated_at']

class StockDetailSerializer(serializers.ModelSerializer):
    price_history = PriceHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'last_price', 'updated_at', 'price_history']