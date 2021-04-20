if (Array.prototype.forEach == null) {
    Array.prototype.forEach = function(f) {
        for (var i = 0; i < this.length; i++) {
            f(i)
        }
    }
}

;(function() {

    var mottle = new jsPlumbBrowserUI.EventManager();
    var _t = function(el, evt, x, y) {
        mottle.trigger(el, evt, { pageX:x, pageY:y, screenX:x, screenY:y, clientX:x, clientY:y});
    };
    var _randomEvent = function() {
        var x = parseInt(Math.random() * 2000), y = parseInt(Math.random() * 2000);
        return {
            clientX:x,
            clientY:y,
            screenX:x,
            screenY:y,
            pageX:x,
            pageY:y
        };
    };
    var _distantPointEvent = {
        clientX: 50000,
        clientY: 50000,
        screenX: 50000,
        screenY: 50000,
        pageX: 50000,
        pageY: 50000
    };
    var _makeEvt = function (_jsPlumb, el) {
        var b = el.getBoundingClientRect()
        var l = b.x + (b.width / 2),
            t = b.y + (b.height / 2)

        return {
            clientX: l,
            clientY: t,
            screenX: l,
            screenY: t,
            pageX: l,
            pageY: t
        };
    };

    var _makeEventAt = function(l, t) {
        return {
            clientX: l,
            clientY: t,
            screenX: l,
            screenY: t,
            pageX: l,
            pageY: t
        };
    };

    var getEndpointCanvas = function(ep) {
        return ep.endpoint.canvas;
    };

    var getConnectionCanvas = function(c) {
        return c.connector.canvas;
    };

    var getCanvas = function(epOrEl) {
        if (epOrEl.endpoint) {
            return getEndpointCanvas(epOrEl);
        } else {
            return epOrEl;
        }
    };

    var getOverlayCanvas = function(overlay) {
        return overlay.canvas || overlay.path
    }

    var _makeDragStartEvt = function(_jsPlumb, el) {
        var e = _makeEvt(_jsPlumb, el), c = _jsPlumb.getContainer();
        e.clientX += c.offsetLeft;
        e.screenX += c.offsetLeft;
        e.pageX += c.offsetLeft;
        e.clientY += c.offsetTop;
        e.screenY += c.offsetTop;
        e.pageY += c.offsetTop;
        return e;
    };

    var _dragANodeAround = function(_jsPlumb, el, functionToAssertWhileDragging, assertMessage) {
        _jsPlumb.trigger(el, "mousedown", _makeEvt(_jsPlumb, el));
        //_jsPlumb.trigger(_jsPlumb.getContainer(), "mousedown", _makeEvt(_jsPlumb, el));
        var steps = Math.random() * 50;
        for (var i = 0; i < steps; i++) {
            var evt = _randomEvent();
            el.style.left = evt.screenX + "px";
            el.style.top= evt.screenY + "px";
            _jsPlumb.trigger(document, "mousemove", evt);
        }

        if (functionToAssertWhileDragging) {
            ok(functionToAssertWhileDragging(), assertMessage || "while dragging assert");
        }

        _jsPlumb.trigger(document, "mouseup", _distantPointEvent);
    };

    var _dragNodeTo = function(_jsPlumb, el, x, y, events) {
        events = events || {};
        var size = _jsPlumb.getSize(el);
        if (events.before) events.before();
        var downEvent = _makeEvt(_jsPlumb, el);
        _jsPlumb.trigger(el, "mousedown", downEvent);

        var cb = _jsPlumb.getContainer().getBoundingClientRect()

        if (events.beforeMouseMove) {
            events.beforeMouseMove();
        }
        _t(document, "mousemove", cb.x + x + (size.w / 2), cb.y + y + (size.h / 2));
        if (events.beforeMouseUp) {
            events.beforeMouseUp();
        }
        mottle.trigger(document, "mouseup");
        if (events.after) events.after();
    };

    var _dragNodeBy = function(_jsPlumb, el, x, y, events) {
        events = events || {};
        if (events.before) events.before();
        var downEvent = _makeEvt(_jsPlumb, el);
        _jsPlumb.trigger(el, "mousedown", downEvent);
        if (events.beforeMouseMove) {
            events.beforeMouseMove();
        }
        _t(document, "mousemove", downEvent.pageX + x, downEvent.pageY + y);
        if (events.beforeMouseUp) {
            events.beforeMouseUp();
        }
        mottle.trigger(document, "mouseup");
        if (events.after) events.after();
    };

    var _aSyncDragNodeBy = function(_jsPlumb, el, x, y, events) {
        events = events || {}
        if (events.before) {
            events.before()
        }


        var downEvent = _makeEvt(_jsPlumb, el);
        _jsPlumb.trigger(el, "mousedown", downEvent);
        if (events.beforeMouseMove) {
            events.beforeMouseMove();
        }
        setTimeout(function() {

            _t(document, "mousemove", downEvent.pageX + x, downEvent.pageY + y);
            if (events.beforeMouseUp) {
                events.beforeMouseUp();
            }

            setTimeout(function() {
                mottle.trigger(document, "mouseup");
                if (events.after) {
                    events.after();
                }
            }, 45)

        }, 45)

    };


    //
    // helper method to cause a connection to be dragged via the mouse, but programmatically.
    //
    var _dragConnection = function (_jsPlumb, d1, d2, mouseUpOnTarget) {
        var el1 = getCanvas(d1), el2 = getCanvas(d2);
        var e1 = _makeEvt(_jsPlumb, el1), e2 = _makeEvt(_jsPlumb, el2);

        var conns = _jsPlumb.select().length;

        _jsPlumb.trigger(el1, "mousedown", e1);
        _jsPlumb.trigger(document, "mousemove", e2);
        _jsPlumb.trigger(mouseUpOnTarget ? el2 : document, "mouseup", e2);

        return _jsPlumb.select().get(conns);
    };

    var _asyncDragConnection = function (_jsPlumb, d1, d2, events) {
        events = events || {}
        var el1 = getCanvas(d1), el2 = getCanvas(d2);
        var e1 = _makeEvt(_jsPlumb, el1), e2 = _makeEvt(_jsPlumb, el2);

        var conns = _jsPlumb.select().length;

        _jsPlumb.trigger(el1, "mousedown", e1);

        setTimeout(function() {
            if (events.beforeMouseMove) {
                events.beforeMouseMove()
            }
            _jsPlumb.trigger(document, "mousemove", e2);
            setTimeout(function() {

                if (events.beforeMouseUp) {
                    events.beforeMouseUp()
                }

                _jsPlumb.trigger(el2 , "mouseup", e2);
                if (events.after) {
                    events.after(_jsPlumb.select().get(conns));
                }
            }, 5)
        }, 5)

    };

    var _dragAndAbort = function (_jsPlumb, d1) {
        var el1 = getCanvas(d1);
        var e1 = _makeEvt(_jsPlumb, el1);

        _jsPlumb.trigger(el1, "mousedown", e1);
        _jsPlumb.trigger(document, "mousemove", _distantPointEvent);
        _jsPlumb.trigger(document, "mouseup", _distantPointEvent);
    };

    //
    // helper method to cause a connection to be detached via the mouse, but programmatically.
    var _detachConnection = function (_jsPlumb, e, connIndex) {
        var el1 = getEndpointCanvas(e),
            c = e.connections[connIndex];

        var e1 = _makeEvt(_jsPlumb, el1);

        _jsPlumb.trigger(el1, "mousedown", e1);
        _jsPlumb.trigger(document, "mousemove", document);
        _jsPlumb.trigger(document, "mouseup", _distantPointEvent);
    };

    var _detachConnectionByTarget = function(_jsPlumb, c) {
        var idx = c.endpoints[1].connections.indexOf(c);
        _detachConnection(_jsPlumb, c.endpoints[1], idx);
    }

    var _relocateTarget = function(_jsPlumb, conn, target, events) {
        _relocate(_jsPlumb, conn, 1, target, events);
    };

    var _relocate = function(_jsPlumb, conn, idx, newEl, events) {
        events = events || {};

        // allow Endpoints to be passed in
        newEl = getCanvas(newEl);

        var el1 = getEndpointCanvas(conn.endpoints[idx]);
        var e1 = _makeEvt(_jsPlumb, el1);
        var e2 = _makeEvt(_jsPlumb, newEl);

        events.before && events.before();

        _jsPlumb.trigger(el1, "mousedown", e1);
        events.beforeMouseMove && events.beforeMouseMove();
        _jsPlumb.trigger(document, "mousemove", e2);
        events.beforeMouseUp && events.beforeMouseUp();
        _jsPlumb.trigger(newEl, "mouseup", e2);

        events.after && events.after();
    };

    var _relocateSource = function(_jsPlumb, conn, source, events) {
        _relocate(_jsPlumb, conn, 0, source, events);
    };

    var _fireEventOnOverlay = function(_jsPlumb, connection, overlayId, event) {
        var overlay = connection.getOverlay(overlayId)
        var canvas = getOverlayCanvas(overlay)
        _jsPlumb.trigger(canvas, event)
    }

    var _fireEventOnConnection = function(_jsPlumb, connection, events) {
        var canvas = getConnectionCanvas(connection)
        for (var i = 2; i < arguments.length; i++) {
            _jsPlumb.trigger(canvas, arguments[i])
        }
    }

    var _clickOnConnection = function(_jsPlumb, connection) {
        _fireEventOnConnection(_jsPlumb, connection, "click")
    }

    var countKeys = function(obj) {
        var i = 0;
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) i++;
        }
        return i;
    };

    var lut = [];
    for (var i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + i.toString(16);
    }

    this.jsPlumbTestSupport = {
        getInstance:function(_jsPlumb) {

            var _divs = [];
            var _addDiv = function (id, parent, className, x, y, w, h) {
                var d1 = document.createElement("div");
                d1.style.position = "absolute";
                d1.innerHTML = id;
                if (parent) parent.appendChild(d1); else _jsPlumb.getContainer().appendChild(d1);
                d1.setAttribute("id", id);
                d1.style.left = (x != null ? x : (Math.floor(Math.random() * 1000))) + "px";
                d1.style.top = (y!= null ? y : (Math.floor(Math.random() * 1000))) + "px";
                if (className) d1.className = className;
                if (w) d1.style.width = w + "px";
                if (h) d1.style.height = h + "px";
                _divs.push(id);
                return d1;
            };

            var _addDraggableDiv = function (_jsPlumb, id, parent, className, x, y, w, h) {
                var d = _addDiv.apply(null, [id, parent, className, x, y, w, h]);
                //_jsPlumb.draggable(d);
                return d;
            };

            var _addDivs = function (ids, parent) {
                for (var i = 0; i < ids.length; i++)
                    _addDiv(ids[i], parent);
            };

            var _assertEndpointCount = function (_jsPlumb, elId, count) {
                var ep = _jsPlumb.getEndpoints(elId),
                    epl = ep ? ep.length : 0;
                equal(epl, count, elId + " has " + count + ((count > 1 || count == 0) ? " endpoints" : " endpoint"));
                //equal(_jsPlumb.anchorManager.getEndpointsFor(elId).length, count, "anchor manager has " + count + ((count > 1 || count == 0) ? " endpoints" : " endpoint") + " for " + elId);
            };

            var _assertManagedEndpointCount = function(_jsPlumb, el, count) {
                var id = _jsPlumb.getId(el),
                    _mel = _jsPlumb._managedElements[id];

                equal(_mel.endpoints.length, count, id + " has " + count + " endpoints in managed record")
            }

            var _assertManagedConnectionCount = function(_jsPlumb, el, count) {
                var id = _jsPlumb.getId(el),
                    _mel = _jsPlumb._managedElements[id];

                equal(_mel.connections.length, count, id + " has " + count + " connections in managed record")
            }

            var _registerDiv = function(div) {
                _divs.push(div)
            }

            return {
                getAttribute:function(el, att) {
                    return el.getAttribute(att);
                },

                isTargetAttribute: "data-jtk-target",
                isSourceAttribute: "data-jtk-source",

                registerDiv:_registerDiv,

                droppableClass:"jtk-droppable",

                dragNodeBy:_dragNodeBy.bind(null, _jsPlumb),

                dragNodeTo:_dragNodeTo.bind(null, _jsPlumb),

                aSyncDragNodeBy:_aSyncDragNodeBy.bind(null, _jsPlumb),

                dragANodeAround:_dragANodeAround.bind(null, _jsPlumb),

                dragConnection:_dragConnection.bind(null, _jsPlumb),

                aSyncDragConnection:_asyncDragConnection.bind(null, _jsPlumb),

                dragAndAbortConnection:_dragAndAbort.bind(null, _jsPlumb),

                dragtoDistantLand:_dragAndAbort.bind(null, _jsPlumb),

                detachConnection:_detachConnection.bind(null, _jsPlumb),
                detachConnectionByTarget:_detachConnectionByTarget.bind(null, _jsPlumb),

                relocate:_relocate.bind(null, _jsPlumb),

                relocateSource:_relocateSource.bind(null, _jsPlumb),

                relocateTarget:_relocateTarget.bind(null, _jsPlumb),

                makeEvent:_makeEvt.bind(null, _jsPlumb),

                getEndpointCanvas:getEndpointCanvas,
                getConnectionCanvas:getConnectionCanvas,

                addDiv:_addDiv,
                addDivs:_addDivs,
                addDraggableDiv:_addDraggableDiv.bind(null, _jsPlumb),
                assertEndpointCount:_assertEndpointCount.bind(null, _jsPlumb),

                assertManagedEndpointCount:_assertManagedEndpointCount.bind(null, _jsPlumb),
                assertManagedConnectionCount:_assertManagedConnectionCount.bind(null, _jsPlumb),

                clickOnConnection:function(connection) {
                    _fireEventOnConnection(_jsPlumb, connection, "click")
                },
                dblClickOnConnection:function(connection) {
                    _fireEventOnConnection(_jsPlumb, connection, "dblclick")
                },
                tapOnConnection:function(connection) {
                    _fireEventOnConnection(_jsPlumb, connection, "mousedown")
                    _fireEventOnConnection(_jsPlumb, connection, "mouseup")
                },
                dblTapOnConnection:function(connection) {
                    _fireEventOnConnection(_jsPlumb, connection, "mousedown")
                    _fireEventOnConnection(_jsPlumb, connection, "mouseup")
                    _fireEventOnConnection(_jsPlumb, connection, "mousedown")
                    _fireEventOnConnection(_jsPlumb, connection, "mouseup")
                },

                clickOnElement:function(element) {
                    _jsPlumb.trigger(element, "click")
                },
                dblClickOnElement:function(element) {
                    _jsPlumb.trigger(element, "dblclick")
                },
                tapOnElement:function(element) {
                    _jsPlumb.trigger(element, "mousedown")
                    _jsPlumb.trigger(element, "mouseup")
                },
                dblTapOnElement:function(element) {
                    _jsPlumb.trigger(element, "mousedown")
                    _jsPlumb.trigger(element, "mouseup")
                    _jsPlumb.trigger(element, "mousedown")
                    _jsPlumb.trigger(element, "mouseup")
                },

                clickOnOverlay:function(connection, overlayId) {
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "click")
                },
                dblClickOnOverlay:function(connection, overlayId) {
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "dblclick")
                },
                tapOnOverlay:function(connection, overlayId) {
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "mousedown")
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "mouseup")
                },
                dblTapOnOverlay:function(connection, overlayId) {
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "mousedown")
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "mouseup")
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "mousedown")
                    _fireEventOnOverlay(_jsPlumb, connection, overlayId, "mouseup")
                },

                cleanup:function() {

                    var container = _jsPlumb.getContainer();

                    _jsPlumb.destroy();

                    for (var i in _divs) {
                        var d = document.getElementById(_divs[i]);
                        d && d.parentNode.removeChild(d);
                    }
                    _divs.length = 0;

                    var connCount = _jsPlumb.select().length,
                        epCount = _jsPlumb.selectEndpoints().length,
                        epElCount = container.querySelectorAll(".jtk-endpoint").length,
                        connElCount = container.querySelectorAll(".jtk-connector").length;

                    //console.log(container.__ta);
                    for (var k in container.__ta) {
                        for (var kk in container.__ta[k]) {
                            throw "Container event bindings not empty for key " + k;
                        }
                    }

                    if (connCount > 0)
                        throw "there are connections in the data model!";

                    if (epCount > 0)
                        throw "there are endpoints in the data model!";

                    if (epElCount > 0) {
                        throw "there are " + epElCount + " endpoints left in the dom!";
                    }
                    //
                    if (connElCount > 0) {
                        throw "there are " + connElCount + " connections left in the dom!";
                    }

                },
                makeContent : function (s) {
                    var d = document.createElement("div");
                    d.innerHTML = s;
                    return d.firstChild;
                },

                countKeys:countKeys,
                length : function(obj) {
                    var c = 0;
                    for (var i in obj) if (obj.hasOwnProperty(i)) c++;
                    return c;
                },
                head : function(obj) {
                    for (var i in obj)
                        return obj[i];
                },
                uuid:function uuid() {
                    var d0 = Math.random() * 0xffffffff | 0;
                    var d1 = Math.random() * 0xffffffff | 0;
                    var d2 = Math.random() * 0xffffffff | 0;
                    var d3 = Math.random() * 0xffffffff | 0;
                    var u = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
                    return "j" + u.replace(/-/g, "")
                }
            }
        }
    };

}).call(this);
