

const all = (selector, cb) => {
    const elems = document.querySelectorAll(selector)
    for (let i = 0, len = elems.length; i < len; i++) {
        cb(elems[i])
    }
}

const hide = (selectorToHide) => {
    all(selectorToHide, (elem) => elem.style.display = "none")
}

const show = (selectorToShow) => {
    all(selectorToShow, (elem) => elem.style.display = "block")
}

const add = (selector,className) => {
    all(selector, (elem) => elem.classList.add(className))
}

const remove = (selector,className) => {
    all(selector, (elem) => elem.classList.remove(className))
}

const toggle = (selectorToToggle) => {
    const st = document.querySelectorAll(selectorToToggle)[0].style.display
    if (!st || st === 'block') {
        hide(selectorToToggle)
    } else {
        show(selectorToToggle)
    }
}

const swap = (selector1,selector2) => {
    const st = document.querySelector(selector1).style.display
    if (!st || st === 'block') {
        hide(selector1)
        show(selector2)
    } else {
        show(selector1)
        hide(selector2)
    }
}


const showUnique = (selectorGroup,selectorUnique) => {
    hide(selectorGroup)
    show(selectorUnique)
}

const classUnique = (selectorGroup,selectorUnique) => {
    remove(selectorGroup, selectorUnique)
    add(selectorGroup, selectorUnique)
}




/* frame functions */

const dragElement = (elem,id) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.querySelector(`[data-wfnoteid="${id}]"`)) {
        document.getElementById(elem.id).onmousedown = dragMouseDown;
    } else {
        elem.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elem.style.top = (elem.offsetTop - pos2) + "px";
        elem.style.left = (elem.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

const initNotes = (selector) => {

    const container = document.createElement('div');
    container.classList.add('wfnotes');
    document.querySelector('body').appendChild(container)

    const elems = document.querySelectorAll(selector)
    for (let i = 0, len = elems.length; i < len; i++) {

        elems[i].classList.add('wfnote--on')

        if (!elems[i].getAttribute('data-alwaysshow')) {
            const parent = elems[i].parentElement

            if (!isVisible(parent)) {
                elems[i].style.display = 'none'
            }

            const onParentVisibilityChange = () => {
                elems[i].style.display = isVisible(parent) ? 'inline-block' : 'none'
            }

            const mutationObserver = new window.MutationObserver(onParentVisibilityChange)
            mutationObserver.observe(parent, {
                attributes: true,
                attributeFilter: ['style', 'class']
            })
        }


        elems[i].setAttribute('data-wfnoteid',i)
        container.appendChild(elems[i])
        elems[i].style.minWidth = elems[i].offsetWidth + 'px'
        dragElement(elems[i],i)

    }
}

const isVisible = (elem) => {

    if (typeof elem === 'string') {
        elem = document.querySelectorAll(elem)[0]
    }

    return elem.offsetHeight > 0 && window.getComputedStyle(elem).getPropertyValue('opacity') > 0 && elem.style.display !=='none'
}


const switchAnchors = (elem,isEnabled) => {
    elem.classList[isEnabled ? 'add' : 'remove']('wfanchor')
}

const switchImagemaps = (elem,isEnabled) => {

    if (isEnabled) {
        $(elem).maphilight({
            alwaysOn:true,
            fill:false,
            strokeWidth:3,
            strokeOpacity: 0.6
        })
    } else {
        all('.maphl', (hl) => {
            const img = hl.querySelector('img')
            hl.parentElement.insertBefore(img, hl)
            img.setAttribute('style', img.getAttribute('data-wfstyle'))
            img.classList.remove('maphilighted')
            hl.remove()
        })
    }

}

const processHighlighting = (isEnabled) => {

    all('.main a',(anchor) => {
        if (isVisible(anchor)) {
            switchAnchors(anchor,isEnabled)
        }
    })

    all('img[usemap]',(image) => {
        if (isVisible(image)) {
            switchImagemaps(image,isEnabled)
        }
    })
}

const clickHandler = () => {
    processHighlighting(false)
    setTimeout(() => {
        if (getCookie('wfhighlight') === 'true') {
            processHighlighting(true)
        }
    },30)
}

const switchHighlighting = (isEnabled, el) => {
    if (isEnabled) {
        processHighlighting(true)
        document.addEventListener('click', clickHandler, true)
        el.classList.add('activated')
        setCookie('wfhighlight', 'true')
    } else {
        processHighlighting(false)
        document.removeEventListener('click', clickHandler, true)
        el.classList.remove('activated')
        setCookie('wfhighlight', '')
    }
}

const switchNotes = (isEnabled, el) => {

    if (isEnabled) {
        document.querySelector('.wfnotes').style.display = "block"
        el.classList.add('activated')
        setCookie('wfnotes', 'true')
    } else {
        document.querySelector('.wfnotes').style.display = "none"
        el.classList.remove('activated')
        setCookie('wfnotes', '')
    }
}


window.addEventListener("load", function() {
    initNotes('.wfnote')

    if (getCookie('wfhighlight') === 'true') {
        switchHighlighting(true,document.getElementById('toggleHighlighting'))
    }

    if (getCookie('wfnotes') === 'true') {
        switchNotes(true,document.getElementById('toggleNotes'))
    }
})
