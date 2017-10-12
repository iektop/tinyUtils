
/**
 * Author: Hector Ariel Gutierrez	 
 * Description: DOM-manipulation utility functions
 **/



(function(){

	/* utility functions */ 
	
	"use strict";
	
	function isNull(v){
		return v === null;
	}
	
	function isUndefined(v){
		return v === undefined
	}
	
	function isNaN(v){
		return v !== v;
	}
	
	function isNumber(v){
		return typeof v === 'number' && !isNaN(v);
	}
	
	function identity(v){
		return v;
	}
	
	function isEmptyString(v){
		return typeof v === 'string' && v.length === 0 ? true : false;
	}
	
	function isArray(v){
		return Array.isArray(v);
	}
	
	/* DOM functions */
	
	function get(selector){
		return document.querySelector(selector);
	}
	
	function getAll(selectors){
		return document.querySelectorAll(selectors);
	}
	
	function create(tag, attributesObject){
		if(tag === '' || isUndefined(tag)) return new TypeError('tag must be defined');
		var element = document.createElement(tag);
		if(isUndefined(attributesObject) || isNull(attributesObject)) return element;
		if(attributesObject.textcontent) element.textContent = attributesObject.textcontent;
		if(attributesObject.src) element.src = attributesObject.src;
		if(attributesObject.href) element.href = attributesObject.href;
		if(attributesObject.title) element.title = attributesObject.title;
		if(attributesObject.target) element.target = attributesObject.target;
		if(attributesObject.type) element.type = attributesObject.type;
		if(attributesObject.classes) element.classes = attributesObject.classes;
		if(attributesObject.id) element.id = attributesObject.id;
		return element;
	}
	
	/**
	 * createAll: creates an array of HTML elements.
	 * a must be of type Array and contain other arrays which specify
	 * the tag for the object and also an optional attributesObject object
	 * which will contain all the possible attributes for the element being created
	 * 
	 **/
	
	function createAll(a){

		if(isUndefined(a) || !isArray(a) || a.length === 0) return;
		var l = a.length;
		var container = [];
		for(var i = 0; i < l; i++){
			container.push(create(a[i][0], a[i][1]));
		}
		return container;
	}
	
	
	function applyStyle(cssRulesObject, element){
		if(typeof element === 'string' && !isEmptyString(element)){
			element = get(element);
		}
		if(isNull(element)) return new Error("Reference to Element does not exist or is not a valid selector");
		for(var p in cssRulesObject){
			element.style[p] = cssRulesObject[p];
		}
		return element;
	}
		
	
	
	/* Configurations options object that will have special custom properties */
	
	Object.defineProperty(Node.prototype, '_configOptions', 
	{
		value: {
			position: undefined
		},
		writable: true,
		configurable: true,
		enumerable: false
	});
	
	/* Pipeline in the form of insert(element).at(position).withRespectOf(anotherElement) */ 
	
	Object.defineProperty(Node.prototype, 'insert', 
	{
		value: function(element, attributesObject){
			if(arguments.length === 0) return this;
			if(!isNull(element) && typeof element === 'object') return identity(element);
			if(typeof element === 'string') return create(element, attributesObject)
		},
		enumerable: true,
		configurable: true,
		writable: false,
	});
	
	Object.defineProperty(Node.prototype, 'at',
	{
		value: function(position){
			if(isEmptyString(position)) return new Error('A valid non-zero-length string must be specified as position');
			switch(position){
				case 'beginning': 
					this._configOptions.position = 'beforebegin';
					break;
				case 'end':
					this._configOptions.position = 'afterend';
					break;
				case 'beginningInside':
					this._configOptions.position = "afterbegin";
					break;
				case 'endInside':
					this._configOptions.position = 'beforeend';
					break;
				default:
					return new Error('Position must be one of the following strings:\n\tbeginning\n\tend\n\tbegginingInside\n\tendInside');
			}
			return this;
		}, 
		enumerable: true,
		configurable: true,
		writable: false
	});
	
	Object.defineProperty(Node.prototype, 'withRespectTo',
		{
			value: function(referenceElement){
				if(!isNull(referenceElement) && typeof referenceElement === 'object'){
					referenceElement.insertAdjacentElement(this._configOptions.position
							, this);
					return true;
				};
				if(typeof referenceElement === 'string' && !isEmptyString(referenceElement)){
					get(referenceElement).insertAdjacentElement(
							this._configOptions.position, this
					)
				};
				return this;
			},
			configurable: true,
			enumerable: true,
			writable: false
		}
	);
	
	/** and connector for pipelining 
	 *  It's sole purpose is to make the pipeline more readable
	 * **/
	
	Object.defineProperty(Node.prototype, 'and', {
		value: function(){
			return this;
		},
		configurable: true,
		writable: false,
		enumerable: false
	});
	
	Object.defineProperty(Node.prototype, 'applyStyle', {
		value: function(cssRulesObject){
			applyStyle(cssRulesObject, this);
			return this;
		},
		configurable: true,
		writable: true,
		enumerable: false
	});
	
	
	function wrapAround(element, tag, attributes){
		if(typeof element === 'string' && !isEmptyString(element)) element = get(element);
		if(isNull(element) || isUndefined(element)) throw new Error('No element to wrap around');
		var parentElement = element.parentElement;
		var previousElement = element.previousElementSibling;
		var nextElement = element.nextElementSibling;
		var container = create(tag, attributes);
		container.appendChild(element);
		
		if(!isNull(parentElement)){
			if(!isNull(previousElement)){
				previousElement.insertAdjacentElement('afterend', container);
			}
			if(!isNull(nextElement)){
				nextElement.insertAdjacentElement('beforebegin', container);
				return;
			}
			parentElement.insertAdjacentElement('beforeend', container);	// If we're here it means that 'element' doesn't have any siblings at all
		}
	}
	
	
	function wrapDeeply(element, wrappersArray, forwards = true){
		if(!Array.isArray(wrappersArray)) return;
		// This is the default mode, which is 'forwards' mode. 
		// This means the array will be iterated starting from the element at index 0,
		// until the element at index wrappersArray.length - 1 
		// wrappersArray is an array of arrays like this: [['tagname', {attributes}],...]
		if(forwards){
			for(let i = 0, l = wrappersArray.length; i < l; i++){
				wrapAround(element, wrappersArray[i][0], wrappersArray[i][1]);
			}
			return;
		}
		// if we're here it means we are going to iterate the array in a backwards fashion. 
		// that is, from its last element to the first.
		for(let i = wrappersArray.length - 1; i >= 0; i--){
			wrapAround(element, wrappersArray[i][0], wrappersArray[i][1]);
		}
	}
	
	
	function unwrap(element, reference = 1, deletionMode = true){
		if(typeof element === 'string') element = get(element);		// if 'element' is a string, treat as a css selector
		if(!element || element.tagName === 'BODY') return;	// if element doesn't exist or is null or is <body>, then simply do nothing.
		var parent = element.parentElement;
		if(parent.tagName === 'BODY') return; 						// if 'element' has <body> as its parent return. 
		if(typeof reference === 'string'){		// If 'reference' was passed as a string
			reference = parseInt(reference);	// Try to parse it if its a number
		}
		if(!reference) return;		// If 'reference' doesn't exists at this point as a number
		var levelOfNestingTarget = getAllLevelsOfNesting(element);
		
			if(levelOfNestingTarget >= reference){
				 ('First checkpoint: levelOfNestingTarget > reference');
				 (parent);
				while(reference){
					unwrap['lastancestor'] = parent;	// keep a reference to the last ancestor of element
					parent = parent.parentElement;
					 (parent);
					--reference;
				}
				unwrap['lastancestor'].insertAdjacentElement('beforebegin', element);	
				if(deletionMode) (unwrap['lastancestor'].parentElement).removeChild(unwrap['lastancestor']);
				return;
			}
			
	}
	
	function getAllLevelsOfNesting(element){
		if(typeof element === 'string') element = get(element);		// if 'element' is a string, treat as a css selector
		if(!element) return;	// if element doesn't exist or is null, then simply do nothing.
		var counter = 0;
		while(element.parentElement.tagName !== 'BODY'){
			++counter;
			element = element.parentElement;
		}
		return counter;
	}
	
	function printAllAncestors(element){
		if(!element) return;
		if(typeof element === 'string') element = get(element);
		var n = getAllLevelsOfNesting(element);
		var ancestor = element.parentElement;
		var allAncestors = ancestor.tagName;
		while(n-- > 1){
			ancestor = ancestor.parentElement;
			allAncestors += ' > ' + ancestor.tagName;
		}
		 console.log(allAncestors);
	}
	
	var _utils = Object.create(null);
	_utils.pipeline = Object.create(null);
	_utils.pipeline['insert'] = Node.prototype.insert;
	_utils.pipeline['at'] = Node.prototype.at;
	_utils.pipeline['withRespectTo'] = Node.prototype.withRespectTo;
	_utils.pipeline['create'] = create;
	_utils.pipeline['and'] = Node.prototype.and;
	_utils.pipeline['applyStyle'] = Node.prototype.applyStyle;
	
	
	
	_utils.get = get;
	_utils.getAll = getAll;
	_utils.create = create;
	_utils.createAll = createAll;
	_utils.applyStyle = applyStyle;
	_utils.wrapAround = wrapAround;
	_utils.wrapDeeply = wrapDeeply;
	_utils.unwrap = unwrap;
	_utils.getAllLevelsOfNesting = getAllLevelsOfNesting;
	_utils.printAllAncestors = printAllAncestors;
	window['_utils'] = _utils;
	
	
}())
		