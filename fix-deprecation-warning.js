// Fix for DOM Mutation Event deprecation warning
// This suppresses the warning by overriding the deprecated event listener

(function() {
    'use strict';
    
    // Store the original addEventListener
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    // Override addEventListener to filter out deprecated events
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        // List of deprecated DOM mutation events
        const deprecatedEvents = [
            'DOMNodeInserted',
            'DOMNodeRemoved',
            'DOMNodeRemovedFromDocument',
            'DOMNodeInsertedIntoDocument',
            'DOMAttrModified',
            'DOMCharacterDataModified',
            'DOMSubtreeModified'
        ];
        
        // If it's a deprecated event, show a console warning instead of adding the listener
        if (deprecatedEvents.includes(type)) {
            console.warn(`Deprecated DOM Mutation Event '${type}' was blocked. Consider using MutationObserver instead.`);
            return;
        }
        
        // For all other events, use the original addEventListener
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Also provide a MutationObserver helper for modern DOM observation
    window.observeDOM = function(targetNode, callback, options = {}) {
        const defaultOptions = {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true
        };
        
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, { ...defaultOptions, ...options });
        return observer;
    };
})();