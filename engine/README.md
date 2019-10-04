## Modules

<dl>
<dt><a href="#module_engine/search">engine/search</a></dt>
<dd></dd>
<dt><a href="#module_models/Throttler">models/Throttler</a></dt>
<dd></dd>
</dl>

<a name="module_engine/search"></a>

## engine/search
**Requires**: <code>module:db</code>, <code>module:helpers</code>  
**Author**: Devon Rojas  

* [engine/search](#module_engine/search)
    * [~SearchEngine](#module_engine/search..SearchEngine)
        * [new SearchEngine(type)](#new_module_engine/search..SearchEngine_new)
        * [._init()](#module_engine/search..SearchEngine+_init)
        * [.search(...terms)](#module_engine/search..SearchEngine+search) ⇒ <code>Array</code>
        * [._idf(df)](#module_engine/search..SearchEngine+_idf) ⇒ <code>number</code>
    * [~Document](#module_engine/search..Document)
        * [new Document(id, title, keywords)](#new_module_engine/search..Document_new)
        * [.includes(term)](#module_engine/search..Document+includes) ⇒ <code>boolean</code>
        * [.setTerms(terms)](#module_engine/search..Document+setTerms)
        * [.calculateScore()](#module_engine/search..Document+calculateScore)
        * [.calculateWeights()](#module_engine/search..Document+calculateWeights)
        * [.tf()](#module_engine/search..Document+tf)
        * [.wf()](#module_engine/search..Document+wf)
        * ~~[.compareFingerprints()](#module_engine/search..Document+compareFingerprints)~~
    * [~Term](#module_engine/search..Term)
        * [new Term(str)](#new_module_engine/search..Term_new)
        * ~~[._getFingerprint()](#module_engine/search..Term+_getFingerprint)~~

<a name="module_engine/search..SearchEngine"></a>

### engine/search~SearchEngine
Handles the search for a particular search category

**Kind**: inner class of [<code>engine/search</code>](#module_engine/search)  

* [~SearchEngine](#module_engine/search..SearchEngine)
    * [new SearchEngine(type)](#new_module_engine/search..SearchEngine_new)
    * [._init()](#module_engine/search..SearchEngine+_init)
    * [.search(...terms)](#module_engine/search..SearchEngine+search) ⇒ <code>Array</code>
    * [._idf(df)](#module_engine/search..SearchEngine+_idf) ⇒ <code>number</code>

<a name="new_module_engine/search..SearchEngine_new"></a>

#### new SearchEngine(type)
Creates an empty SearchEngine object.


| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | Either 'Program', 'Course', or 'Career' |

<a name="module_engine/search..SearchEngine+_init"></a>

#### searchEngine.\_init()
Loads search engine with all documents of type passed in to constructor.If a cached file exists in /cache, the Search Engine pulls from that tospeed up search process.

**Kind**: instance method of [<code>SearchEngine</code>](#module_engine/search..SearchEngine)  
<a name="module_engine/search..SearchEngine+search"></a>

#### searchEngine.search(...terms) ⇒ <code>Array</code>
Searches documents against term(s) passed in to function and returns relevant matches.

**Kind**: instance method of [<code>SearchEngine</code>](#module_engine/search..SearchEngine)  
**Returns**: <code>Array</code> - A list of all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| ...terms | <code>String</code> | Term(s) to search for in documents. |

<a name="module_engine/search..SearchEngine+_idf"></a>

#### searchEngine.\_idf(df) ⇒ <code>number</code>
Calculates the inverse document frequency of a collection

**Kind**: instance method of [<code>SearchEngine</code>](#module_engine/search..SearchEngine)  
**Returns**: <code>number</code> - The inverse document frequencey of a collection  

| Param | Type | Description |
| --- | --- | --- |
| df | <code>number</code> | The document frequency of a collection |

<a name="module_engine/search..Document"></a>

### engine/search~Document
Handles the logic for a specific document in a collection

**Kind**: inner class of [<code>engine/search</code>](#module_engine/search)  

* [~Document](#module_engine/search..Document)
    * [new Document(id, title, keywords)](#new_module_engine/search..Document_new)
    * [.includes(term)](#module_engine/search..Document+includes) ⇒ <code>boolean</code>
    * [.setTerms(terms)](#module_engine/search..Document+setTerms)
    * [.calculateScore()](#module_engine/search..Document+calculateScore)
    * [.calculateWeights()](#module_engine/search..Document+calculateWeights)
    * [.tf()](#module_engine/search..Document+tf)
    * [.wf()](#module_engine/search..Document+wf)
    * ~~[.compareFingerprints()](#module_engine/search..Document+compareFingerprints)~~

<a name="new_module_engine/search..Document_new"></a>

#### new Document(id, title, keywords)
Initializes the document.


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Document identifier. |
| title | <code>string</code> | Title of document. |
| keywords | <code>string</code> | Keywords within document. |

<a name="module_engine/search..Document+includes"></a>

#### document.includes(term) ⇒ <code>boolean</code>
Checks whether a search term exists in the document's keywords.

**Kind**: instance method of [<code>Document</code>](#module_engine/search..Document)  
**Returns**: <code>boolean</code> - Whether the term exists in the document's keywords.  

| Param | Type |
| --- | --- |
| term | <code>string</code> | 

<a name="module_engine/search..Document+setTerms"></a>

#### document.setTerms(terms)
Sets a document's query terms, and calculates the frequencies of each term.

**Kind**: instance method of [<code>Document</code>](#module_engine/search..Document)  

| Param | Type | Description |
| --- | --- | --- |
| terms | <code>Array.&lt;string&gt;</code> | A list of terms to search document against. |

<a name="module_engine/search..Document+calculateScore"></a>

#### document.calculateScore()
Calculates the total score of a document based on query terms.

**Kind**: instance method of [<code>Document</code>](#module_engine/search..Document)  
**See**: [Vector Space Model Formula](https://en.wikipedia.org/wiki/Vector_space_model)  
**Example**  
```js
// Formula: Score = SUM[term idf (inverse document frequency) * term wd (term weight)]
```
<a name="module_engine/search..Document+calculateWeights"></a>

#### document.calculateWeights()
Calculates the weights of each term in the query based off of the document term frequency.

**Kind**: instance method of [<code>Document</code>](#module_engine/search..Document)  
<a name="module_engine/search..Document+tf"></a>

#### document.tf()
Calculates the term frequency in the document of each query term.

**Kind**: instance method of [<code>Document</code>](#module_engine/search..Document)  
<a name="module_engine/search..Document+wf"></a>

#### document.wf()
Calculates the frequency weight of each query term.

**Kind**: instance method of [<code>Document</code>](#module_engine/search..Document)  
<a name="module_engine/search..Document+compareFingerprints"></a>

#### ~~document.compareFingerprints()~~
***Deprecated***

**Kind**: instance method of [<code>Document</code>](#module_engine/search..Document)  
<a name="module_engine/search..Term"></a>

### engine/search~Term
Handles the properties of a query term.

**Kind**: inner class of [<code>engine/search</code>](#module_engine/search)  

* [~Term](#module_engine/search..Term)
    * [new Term(str)](#new_module_engine/search..Term_new)
    * ~~[._getFingerprint()](#module_engine/search..Term+_getFingerprint)~~

<a name="new_module_engine/search..Term_new"></a>

#### new Term(str)
Initializes the Term.


| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | The query term. |

<a name="module_engine/search..Term+_getFingerprint"></a>

#### ~~term.\_getFingerprint()~~
***Deprecated***

**Kind**: instance method of [<code>Term</code>](#module_engine/search..Term)  
<a name="module_models/Throttler"></a>

## models/Throttler
**Author**: Devon Rojas  

* [models/Throttler](#module_models/Throttler)
    * [~Throttler](#module_models/Throttler..Throttler)
        * [new Throttler(arr, [rateLimitCount], [rateLimitTime])](#new_module_models/Throttler..Throttler_new)
        * [.execute(callbackFn)](#module_models/Throttler..Throttler+execute) ⇒ <code>Array</code>
    * [~throttle(calls, rateLimitCount, rateLimitTime)](#module_models/Throttler..throttle) ⇒ <code>Array</code>
    * [~timeout(ms)](#module_models/Throttler..timeout) ⇒ <code>Promise</code>

<a name="module_models/Throttler..Throttler"></a>

### models/Throttler~Throttler
Class containing logic to throttle a large number of function executions.

**Kind**: inner class of [<code>models/Throttler</code>](#module_models/Throttler)  

* [~Throttler](#module_models/Throttler..Throttler)
    * [new Throttler(arr, [rateLimitCount], [rateLimitTime])](#new_module_models/Throttler..Throttler_new)
    * [.execute(callbackFn)](#module_models/Throttler..Throttler+execute) ⇒ <code>Array</code>

<a name="new_module_models/Throttler..Throttler_new"></a>

#### new Throttler(arr, [rateLimitCount], [rateLimitTime])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| arr | <code>Array</code> |  | Array of items to perform an operation on |
| [rateLimitCount] | <code>number</code> | <code>1</code> | Number of executions to perform per rateLimitTime |
| [rateLimitTime] | <code>number</code> | <code>1000</code> | Amount of time (in milliseconds) to wait between execution batches |

<a name="module_models/Throttler..Throttler+execute"></a>

#### throttler.execute(callbackFn) ⇒ <code>Array</code>
Executes, in batch sizes specified in the [constructor](module:models/Throttler#constructor), acallback function on each item in the Throttler's item array.

**Kind**: instance method of [<code>Throttler</code>](#module_models/Throttler..Throttler)  
**Returns**: <code>Array</code> - Resulting response array from throttled callback functions.  
**See**: [Utils.throttle()](module:helpers/Utils~throttle)  

| Param | Type | Description |
| --- | --- | --- |
| callbackFn | <code>function</code> | An _asynchronous_ callback function to perform on each item - Must handle two arguments, (cb, item),  with cb being a returned function and item being the current item from the array. |

**Example**  
```js
A sample callbackFn argument.async callbackFn(cb, item) => {     // Perform some operation on item     cb();}
```
<a name="module_models/Throttler..throttle"></a>

### models/Throttler~throttle(calls, rateLimitCount, rateLimitTime) ⇒ <code>Array</code>
Asynchronously executes callback functions per the rateLimitCount and rateLimitTimevalues passed in to the function.

**Kind**: inner method of [<code>models/Throttler</code>](#module_models/Throttler)  
**Returns**: <code>Array</code> - Reponse data from all calls.  

| Param | Type | Description |
| --- | --- | --- |
| calls | <code>Array</code> | Array of calls to execute |
| rateLimitCount | <code>number</code> | Amount of calls to make sychronously |
| rateLimitTime | <code>number</code> | Amount of time to wait between batches |

<a name="module_models/Throttler..timeout"></a>

### models/Throttler~timeout(ms) ⇒ <code>Promise</code>
Sets a timeout.

**Kind**: inner method of [<code>models/Throttler</code>](#module_models/Throttler)  
**Returns**: <code>Promise</code> - A completed Promise after timeout finishes.  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Amount of time in milliseconds to wait. |

