<a name="module_MesaSearchEngine"></a>

# MesaSearchEngine
The MesaSearchEngine was created to provide a search functionality to San Diego Mesa College's Acadmeic Programs site. It employs the strategy of using the vector space model to accurately identify search terms in a user's query and return the most relevant document matches from a collection. Using cortical.io's keyword extraction API and IBM Watson's NLP/NLU service to identify meaningful keywords in larger chunks of text, (e.g. program and course descriptions), the program aggregates all results from these services into compact data structures within each document to improve the efficiency at which the search engine can identify relevant documents. This package is coupled with the [CareerEducationAPI](https://github.com/devonrojas/MesaONET_API), that generates much of the data used in the Search Engine.

Potential improvements:
- Figure out a way to work around cortical.io's request limiting to use Fingerprint comparison methods for better search results
- Increase response time to client from Search Engine
- ???

**Requires**: <code>{@link https://www.npmjs.com/package/express\| express}</code>, <code>{@link https://www.npmjs.com/package/cors\| cors}</code>, <code>{@link https://www.npmjs.com/package/body-parser\| body-parser}</code>, <code>{@link https://nodejs.org/api/http.html\| http}</code>, <code>{@link https://mongoosejs.com/docs/guide.html\| mongoose}</code>, <code>{@link https://www.npmjs.com/package/request-promise\|request-promise}</code>, <code>module:routes</code>  
**Author**: Devon Rojas  

* [MesaSearchEngine](#module_MesaSearchEngine)
    * [~app](#module_MesaSearchEngine..app) : <code>object</code>
        * [.GET/docs()](#module_MesaSearchEngine..app.GET/docs)
        * [.GET/()](#module_MesaSearchEngine..app.GET/)
        * [.GET/course/:id(id)](#module_MesaSearchEngine..app.GET/course/_id)
        * [.GET/program/:id(id)](#module_MesaSearchEngine..app.GET/program/_id)

<a name="module_MesaSearchEngine..app"></a>

### MesaSearchEngine~app : <code>object</code>
express module

**Kind**: inner namespace of [<code>MesaSearchEngine</code>](#module_MesaSearchEngine)  

* [~app](#module_MesaSearchEngine..app) : <code>object</code>
    * [.GET/docs()](#module_MesaSearchEngine..app.GET/docs)
    * [.GET/()](#module_MesaSearchEngine..app.GET/)
    * [.GET/course/:id(id)](#module_MesaSearchEngine..app.GET/course/_id)
    * [.GET/program/:id(id)](#module_MesaSearchEngine..app.GET/program/_id)

<a name="module_MesaSearchEngine..app.GET/docs"></a>

#### app.GET/docs()
Loads application documentation pages.

**Kind**: static method of [<code>app</code>](#module_MesaSearchEngine..app)  
<a name="module_MesaSearchEngine..app.GET/"></a>

#### app.GET/()
Displays list of available routes on /

**Kind**: static method of [<code>app</code>](#module_MesaSearchEngine..app)  
<a name="module_MesaSearchEngine..app.GET/course/_id"></a>

#### app.GET/course/:id(id)
Retrieves course information from a course id.

**Kind**: static method of [<code>app</code>](#module_MesaSearchEngine..app)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | A valid course id. |

**Example**  
```js
// /course/15-1134.00
```
<a name="module_MesaSearchEngine..app.GET/program/_id"></a>

#### app.GET/program/:id(id)
Retrieves program information from a program id.

**Kind**: static method of [<code>app</code>](#module_MesaSearchEngine..app)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | A valid program id. |

**Example**  
```js
// /program/1
```
