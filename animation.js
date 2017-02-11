function animate(el, property, value, duration, callback) {

    duration = duration || 300;
    callback = callback || function() {};
    value = parseValue(String(value));

    var currentValue = parseValue(getComputedStyle(el,null).getPropertyValue(property));

    var targetValue = value - currentValue;
    var changeFactor = targetValue / (60 * (duration / 1000));
    var start = new Date().getTime();

    el.style[property] = parseValue(getComputedStyle(el,null).getPropertyValue(property));

    function animator(timestamp) {

        el.style[property] = parseValue(el.style[property]) + changeFactor;

        var progress = new Date().getTime() - start;
        
        if(progress < duration) {
            requestAnimationFrame(animator); 
        } else {
            el.style[property] = Number(value);
            callback();
        }
        
    }

    // Initial Call
    requestAnimationFrame(animator);
    
}


function parseValue(value) {
    var unit = value.slice(value.length - 1);

    if(isNaN(unit)) {
        return Number(value.slice(0, value.length - 2));
    }

    else {
        return Number(value);
    }
}

function hide(el) {

    animate(el,'opacity', '0', 500);
}

function show(el) {
    
    animate(el,'opacity', '1', 500);
}

function updateTextContent(el, newContent, direction) { 
    
    direction = direction || 'top';

    el.style.position = 'relative';
    animate(el, direction, '-10', 100);
    animate(el, 'opacity', '0', 100, function(){

        el.innerHTML = (Boolean(newContent)) ? newContent : "&nbsp;";
        el.style[direction] = '20';
        animate(el, direction, '0', 100);
        animate(el, 'opacity', '1', 100, function(){
            el.style[direction] = '';
        });
    });
}

function popUpMessage(el, text) {
    updateTextContent(el, text);
    setTimeout(function() {updateTextContent(el, null)}, 2000);
}

function moveElement(el, destinationParent, duration, callback) {

    var elOriginalStyles = window.getComputedStyle(el,null);
    var destOriginalStyles = window.getComputedStyle(destinationParent,null);

    elPosition = el.getBoundingClientRect();
    destPosition = destinationParent.getBoundingClientRect();

    originalElementPosition = elOriginalStyles.getPropertyValue('position');
    originalElementYPosition = elOriginalStyles.getPropertyValue('top');
    originalElementXPosition = elOriginalStyles.getPropertyValue('left');

    moveY = destPosition.top - elPosition.top;
    moveX = destPosition.left - elPosition.left;

    
    var destHeight = parseValue(destOriginalStyles.getPropertyValue("height"));
    animate(destinationParent, 'height',  destHeight + 30, duration);
    
    el.style.position = 'relative';
    animate(el, 'zoom', '0.2', duration);
    animate(el, 'top', moveY, duration);
    animate(el, 'left', moveX, duration, function() {
        el.style.opacity = 0;

        var newContent = el.cloneNode();
        
    
            destinationParent.style.height = 'auto';

            // Resetting the moved object to avoid messing up the dom;
            // Which means if it needs to be removed, it has to be removed in the callback; 
            el.style.position = originalElementPosition;
            el.style.top = originalElementYPosition;
            el.style.left = originalElementXPosition;
            el.style.zoom = 1
        

        callback = callback() || (function() {})();
    });
}

function wrapChildren(el) {
    var tempWrapper = document.createElement('span');
    tempWrapper.innerHTML = el.innerHTML;
    tempWrapper.style.display = 'inherit';
    tempWrapper.style.width = '100%';
    tempWrapper.style.margin = '0';
    tempWrapper.style.padding = '0';

    el.innerHTML = "";
    el.appendChild(tempWrapper);

    return tempWrapper;
}