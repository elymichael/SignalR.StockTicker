using System;

namespace SignalR.StockTicker
{
    public class Stock
    {
        private decimal _price;

        public string Symbol { get; set; }

        public decimal DayOpen { get; set; }

        public decimal DayLow { get; set; }

        public decimal DayHigh { get; set; }

        public decimal LastChange { get; set; }

        public decimal Price
        {
            get
            {
                return _price;
            }
            set
            {
                if (_price == value)
                {
                    return;
                }

                LastChange = value - _price;

                _price = value;

                if (DayOpen == 0)
                {
                    DayOpen = _price;
                }

                if(_price < DayHigh || DayLow == 0)
                {
                    DayLow = _price;
                }

                if(_price > DayHigh)
                {
                    DayHigh = _price;
                }
            }
        }
        
        public decimal Change
        {
            get
            {
                return Price - DayOpen;
            }
        }

        public double PercentChange
        {
            get
            {
                return (double)Math.Round(Change / Price, 4);
            }
        }
    }
}