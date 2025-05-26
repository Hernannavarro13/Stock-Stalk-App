from django.db import models
from django.contrib.auth.models import User

class Stock(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    last_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    predicted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    prediction_date = models.DateTimeField(null=True, blank=True)
    model_accuracy = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.symbol} - {self.name}"

class PriceHistory(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='price_history')
    date = models.DateField()
    open_price = models.DecimalField(max_digits=10, decimal_places=2)
    high_price = models.DecimalField(max_digits=10, decimal_places=2)
    low_price = models.DecimalField(max_digits=10, decimal_places=2)
    close_price = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.BigIntegerField()
    
    class Meta:
        unique_together = ('stock', 'date')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.stock.symbol} - {self.date}"

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')
    stocks = models.ManyToManyField(Stock, related_name='watchlists')
    name = models.CharField(max_length=100, default='Default Watchlist')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'name')
    
    def __str__(self):
        return f"{self.user.username}'s {self.name}"
