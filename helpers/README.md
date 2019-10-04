## Modules

<dl>
<dt><a href="#module_service/cortical">service/cortical</a></dt>
<dd></dd>
<dt><a href="#module_helpers">helpers</a></dt>
<dd></dd>
<dt><a href="#module_service/watson_nlp">service/watson_nlp</a></dt>
<dd></dd>
<dt><a href="#module_service/wikipedia">service/wikipedia</a></dt>
<dd></dd>
</dl>

<a name="module_service/cortical"></a>

## service/cortical
**Requires**: <code>{@link https://www.npmjs.com/package/request-promise\| request-promise}</code>, <code>module:engine/throttler</code>  
**Author**: Devon Rojas  
<a name="module_service/cortical.cortical"></a>

### service/cortical.cortical(query)
Retrieves all terms associated with a given word or phrase.

**Kind**: static method of [<code>service/cortical</code>](#module_service/cortical)  

| Param | Type |
| --- | --- |
| query | <code>string</code> | 

<a name="module_helpers"></a>

## helpers
**Requires**: [<code>service/wikipedia</code>](#module_service/wikipedia), [<code>service/watson\_nlp</code>](#module_service/watson_nlp), [<code>service/cortical</code>](#module_service/cortical)  
**Author**: Devon Rojas  

* [helpers](#module_helpers)
    * [~asyncForEach(arr, cb)](#module_helpers..asyncForEach)
    * [~clean_stop_words(str)](#module_helpers..clean_stop_words)

<a name="module_helpers..asyncForEach"></a>

### helpers~asyncForEach(arr, cb)
Asynchronously executes a callback function for each element in an array.

**Kind**: inner method of [<code>helpers</code>](#module_helpers)  

| Param | Type |
| --- | --- |
| arr | <code>Array</code> | 
| cb | <code>function</code> | 

<a name="module_helpers..clean_stop_words"></a>

### helpers~clean\_stop\_words(str)
Removes all stop words from a string.

**Kind**: inner method of [<code>helpers</code>](#module_helpers)  

| Param | Type |
| --- | --- |
| str | <code>String</code> | 

<a name="module_service/watson_nlp"></a>

## service/watson\_nlp
**Requires**: <code>{@link https://www.npmjs.com/package/request-promise\| request-promise}</code>  
**Author**: Devon Rojas  
<a name="module_service/watson_nlp.watson_nlp"></a>

### service/watson_nlp.watson\_nlp(text, threshold)
Extracts keywords from text.

**Kind**: static method of [<code>service/watson\_nlp</code>](#module_service/watson_nlp)  

| Param | Type |
| --- | --- |
| text | <code>String</code> | 
| threshold | <code>Number</code> | 

<a name="module_service/wikipedia"></a>

## service/wikipedia
**Requires**: <code>{@link https://www.npmjs.com/package/request-promise\| request-promise}</code>  
**Author**: Devon Rojas  
<a name="module_service/wikipedia.wiki_query"></a>

### service/wikipedia.wiki\_query(str)
Searches Wikipedia for relevant pages and returns page text.

**Kind**: static method of [<code>service/wikipedia</code>](#module_service/wikipedia)  

| Param | Type |
| --- | --- |
| str | <code>String</code> | 

