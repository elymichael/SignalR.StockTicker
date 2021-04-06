// A simple templating method for replacing placeholders enclosed in curly braces.
if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

jQuery.fn.flash = function (color, duration) {
    var current = this.css('backgroundColor');
    this.animate({ backgroundColor: 'rgb(' + color + ')' }, duration / 2)
        .animate({
            backgroundColor: current
        }, duration / 2);
};

$(function () {

    var ticker = $.connection.stockTickerMini, // the generated client-side hub proxy
        up = '▲',
        down = '▼',
        $stockTable = $('#stockTable'),
        $stockTableBody = $stockTable.find('tbody'),
        rowTemplate = '<tr data-symbol="{Symbol}"><td>{Symbol}</td><td>{Price}</td><td>{DayOpen}</td><td>{Direction} {Change}</td><td>{PercentChange}</td></tr>',
        $stockTicker = $('#stockTicker'),
        $stockTickerUl = $stockTicker.find('ul'),
        liTemplate = '<li data-symbol="{Symbol}"><span class="symbol">{Symbol}</span><span class="price">{Price}</span><span class="change"><span class="dir {DirectionClass}">{Direction}</span>{Change} ({PercentChange})</span></li>';

    function formatStock(stock) {
        return $.extend(stock, {
            Price: stock.Price.toFixed(2),
            PercentChange: (stock.PercentChange * 100).toFixed(2) + '%',
            Direction: stock.Change === 0 ? '' : stock.Change >= 0 ? up : down,
            DirectionClass: stock.Change === 0 ? 'even': stock.Change >= 0 ? 'up': 'down'
        });
    }

    function scrollTicker() {
        var w = $stockTickerUl.width();
        $stockTickerUl.css({ marginLeft: w });
        $stockTickerUl.animate({ marginLeft: -w }, 15000, 'linear', scrollTicker);
    }

    function stopTicker() {
        $stockTickerUl.stop();
    } 

    function init() {
        ticker.server.getAllStocks().done(function (stocks) {
            $stockTableBody.empty();
            $stockTickerUl.empty();
            $.each(stocks, function () {
                var stock = formatStock(this);
                $stockTableBody.append(rowTemplate.supplant(stock));
                $stockTickerUl.append(liTemplate.supplant(stock));
            });
        });
    }

    // Add a client-side hub method that the server will call
    ticker.client.updateStockPrice = function (stock) {
        var displayStock = formatStock(stock),
            $row = $(rowTemplate.supplant(displayStock)),
            $li = $(liTemplate.supplant(displayStock)),
            bg = stock.LastChange < 0
            ? '255,148,148' : '154,240,117';


        $stockTableBody.find('tr[data-symbol=' + stock.Symbol + ']')
            .replaceWith($row);
        $stockTickerUl.find('li[data-symbol=' + stock.Symbol + ']')
            .replaceWith($li);

        $row.flash(bg, 1000);
        $li.flash(bg, 1000);

        scrollTicker();
    }

    // Start the connection
    $.connection.hub.start().done(init);

});