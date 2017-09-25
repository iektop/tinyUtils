(function(){
	
	function get(selector){
		return document.querySelector(selector);
	};
	
	get['description'] = 
	
	`
	Returns the first element that is a descendant of the element on which it is invoked that matches the specified group of selectors.
	
	Syntax:
	var element = get(selector[s]);
	
	`;
	
	function getAll(selector){
		return document.querySelectorAll(selector);
	};

	getAll['description'] = 
	
	`
	Returns a non-live Nodelist of element objects.

	Syntax:
	var elementList = getAll(selectors);
	
	`;
	
	function createElement(tag, {id, classes, href, src, textcontent, title, target} = {}){
		var element = document.createElement(tag);
		if(id) element.id = id;
		if(classes) element.setAttribute('class', classes);
		if(href) element.href = href;
		if(src) element.src = src;
		if(textcontent) element.textContent = textcontent;
		if(title) element.title = title;
		if(target) element.target = target;
		return element;
	};
	
	createElement['description'] = 
	`
	Creates an HTMLElement with the attributes passed to this function.
	
	Syntax: 
	var element = createElement('tag'[,{id, classes, href, src, textcontent, title, target}]);
	
	
	Parameters:
	tag: refers to the html tag for this element
	`;
	
	function wrapAround(element, tag, attributes){
		if(typeof element === 'string') element = get(element);	// if 'element' is a selector string, create such element
		if(element === null) throw new Error('No element to wrap around');
		var parent = element.parentElement;
		var previousElement = element.previousElementSibling;	// Finds out if 'element' is not the last element in DOM
		var nextElement = element.nextElementSibling;			// Finds out if 'element' has any other sibling inserted after it
		var container = createElement(tag, attributes);
		container.appendChild(element);
		if(parent !== null){
			if(previousElement !== null) {
				previousElement.insertAdjacentElement('afterend', container);
				return;
			}
			if(nextElement !== null){
				nextElement.insertAdjacentElement('beforebegin', container);
				return;
			}
			parent.insertAdjacentElement('beforeend', container);	// If we're here it means that 'element' doesn't have any siblings at all
		}
	};	
	
	wrapAround['description'] = 
	`
	Description: Creates an HTMLElement and wraps another element around it. 
	
	Syntax:
	wrapAround(element, tag[, attributes]);
	
	Parameters: 
	element: A css selector or identifier indicating our target element which will be wrapped around another element.
	tag: An html tag of the element that will contain our target element.
	attributes: an object that contains the attributes that will be applied to the element created using the tag parameter
	`;
	
	function wrapDeeply(element, wrappersArray, forwards = true){
		if(!Array.isArray(wrappersArray)) return;
		// This is the default mode, which is 'forwards' mode. 
		// This means the array will be iterated starting from the element at index 0,
		// until the element at index wrappersArray.length - 1 
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
	
	
	function style(cssrulesobject, element){
		if(typeof element === 'string') element = get(element);
		for(var p in cssrulesobject){
			element.style[p] = cssrulesobject[p];
		}
	};
	
	style['description'] = 
	`
	Applies inline styling to the target element.
	
	Syntax:
	style(cssrulesobject,element)
	
	Parameters:
	cssrulesobject: An object which contains a collection of CSS rules and their respective values to be applied to the target element.
	element: An identifier or selector that specifies the element which will be the target of inline styling
	`;
	
	
	function styleAll(cssrulesobject, ...elements){		// takes either a comma-separated list of element arguments, 
		var set = new Set();
		var iterator = elements.entries();
		for(var [,val] of iterator){
			if(typeof val === 'string'){
				get(val) ? set.add(get(val)) : undefined;	// if it is a valid element selector
				continue;
			}
			if(typeof val === 'object' && val !== null && val.length){				// if it is a collection object like a NodeList
				val.forEach(c => set.add(c));
				continue;
			}
			if(val){			// if it is an HTMLElement object
				set.add(val);
			}
		}
		for(var el of set){
			for(var p in cssrulesobject){
				el.style[p] = cssrulesobject[p];
			}
		}
	};
	
	
	styleAll['description'] = 
	`
	Styles one or several HTMLElement objects according to the CSS rules specified in the cssrulesobject parameter.
	
	Syntax:
	
	styleAll(cssrulesobject, ...elements)
	
	Parameters:
	cssrulesobject: An object which contains a collection of CSS rules and their respective values to be applied to the target elements.
	...elements : A comma-separated list of arbitrary HTML elements like the ones returned by get() or getAll() or CSS selectors
	`;
	
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
				console.log('First checkpoint: levelOfNestingTarget > reference');
				console.log(parent);
				while(reference){
					unwrap['lastancestor'] = parent;	// keep a reference to the last ancestor of element
					parent = parent.parentElement;
					console.log(parent);
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
	
	var $$utils = Object.create(null);
	$$utils['get'] = get;
	$$utils['getAll'] = getAll;
	$$utils['createElement'] = createElement;
	$$utils['wrapAround'] = wrapAround;
	$$utils['style'] = style;
	$$utils['styleAll'] = styleAll;
	$$utils['getAllLevelsOfNesting'] = getAllLevelsOfNesting;
	$$utils['unwrap'] = unwrap;
	$$utils['printAllAncestors'] = printAllAncestors;
	$$utils['wrapDeeply'] = wrapDeeply;
	window['utils'] = $$utils;
	
}());