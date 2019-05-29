
var div = document.querySelector('#ta-frame');
var ta = document.querySelector('textarea');

ta.addEventListener('keydown', autosize);

function autosize() {
    setTimeout(function() {
        ta.style.height = '32px';
        var height = Math.min(20 * 7, ta.scrollHeight);
        // div.style.cssText = 'height:' + height*1.3 + 'px';
        ta.style.height = height + "px";
    }, 0);
}
