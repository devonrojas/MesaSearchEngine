## Modules

<dl>
<dt><a href="#module_routes/admin">routes/admin</a></dt>
<dd></dd>
<dt><a href="#module_routes">routes</a></dt>
<dd></dd>
<dt><a href="#module_routes/search">routes/search</a></dt>
<dd></dd>
</dl>

<a name="module_routes/admin"></a>

## routes/admin
**Requires**: <code>{@link https://www.npmjs.com/package/express\| express}</code>, <code>{@link https://www.npmjs.com/package/request-promise\| request-promise}</code>, <code>module:db</code>, <code>module:engine/throttler</code>  
**Author**: Devon Rojas  

* [routes/admin](#module_routes/admin)
    * [~adminRouter](#module_routes/admin..adminRouter) : <code>object</code>
        * [.GET/generatecareers()](#module_routes/admin..adminRouter.GET/generatecareers)
        * [.GET/generateprograms()](#module_routes/admin..adminRouter.GET/generateprograms)
        * [.GET/generatecourses()](#module_routes/admin..adminRouter.GET/generatecourses)
        * [.GET/programs()](#module_routes/admin..adminRouter.GET/programs)
        * [.GET/program/:code()](#module_routes/admin..adminRouter.GET/program/_code)
        * [.POST/program/:code()](#module_routes/admin..adminRouter.POST/program/_code)
        * [.PUT/program/:code()](#module_routes/admin..adminRouter.PUT/program/_code)
        * [.DELETE/program/:code()](#module_routes/admin..adminRouter.DELETE/program/_code)
        * [.GET/careers()](#module_routes/admin..adminRouter.GET/careers)
        * [.GET/career/:code()](#module_routes/admin..adminRouter.GET/career/_code)
        * [.POST/career/:code()](#module_routes/admin..adminRouter.POST/career/_code)
        * [.PUT/career/:code()](#module_routes/admin..adminRouter.PUT/career/_code)
        * [.DELETE/career/:code()](#module_routes/admin..adminRouter.DELETE/career/_code)
        * [.GET/courses()](#module_routes/admin..adminRouter.GET/courses)
        * [.GET/course/:code()](#module_routes/admin..adminRouter.GET/course/_code)
        * [.POST/course/:code()](#module_routes/admin..adminRouter.POST/course/_code)
        * [.PUT/course/:code()](#module_routes/admin..adminRouter.PUT/course/_code)
        * [.DELETE/course/:code()](#module_routes/admin..adminRouter.DELETE/course/_code)

<a name="module_routes/admin..adminRouter"></a>

### routes/admin~adminRouter : <code>object</code>
**Kind**: inner namespace of [<code>routes/admin</code>](#module_routes/admin)  

* [~adminRouter](#module_routes/admin..adminRouter) : <code>object</code>
    * [.GET/generatecareers()](#module_routes/admin..adminRouter.GET/generatecareers)
    * [.GET/generateprograms()](#module_routes/admin..adminRouter.GET/generateprograms)
    * [.GET/generatecourses()](#module_routes/admin..adminRouter.GET/generatecourses)
    * [.GET/programs()](#module_routes/admin..adminRouter.GET/programs)
    * [.GET/program/:code()](#module_routes/admin..adminRouter.GET/program/_code)
    * [.POST/program/:code()](#module_routes/admin..adminRouter.POST/program/_code)
    * [.PUT/program/:code()](#module_routes/admin..adminRouter.PUT/program/_code)
    * [.DELETE/program/:code()](#module_routes/admin..adminRouter.DELETE/program/_code)
    * [.GET/careers()](#module_routes/admin..adminRouter.GET/careers)
    * [.GET/career/:code()](#module_routes/admin..adminRouter.GET/career/_code)
    * [.POST/career/:code()](#module_routes/admin..adminRouter.POST/career/_code)
    * [.PUT/career/:code()](#module_routes/admin..adminRouter.PUT/career/_code)
    * [.DELETE/career/:code()](#module_routes/admin..adminRouter.DELETE/career/_code)
    * [.GET/courses()](#module_routes/admin..adminRouter.GET/courses)
    * [.GET/course/:code()](#module_routes/admin..adminRouter.GET/course/_code)
    * [.POST/course/:code()](#module_routes/admin..adminRouter.POST/course/_code)
    * [.PUT/course/:code()](#module_routes/admin..adminRouter.PUT/course/_code)
    * [.DELETE/course/:code()](#module_routes/admin..adminRouter.DELETE/course/_code)

<a name="module_routes/admin..adminRouter.GET/generatecareers"></a>

#### adminRouter.GET/generatecareers()
Generates new career data from ONET database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/generateprograms"></a>

#### adminRouter.GET/generateprograms()
Generates new program data from static file.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/generatecourses"></a>

#### adminRouter.GET/generatecourses()
Generates new course data from static file.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/programs"></a>

#### adminRouter.GET/programs()
Retrieves all programs in database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/program/_code"></a>

#### adminRouter.GET/program/:code()
Retrieves a single program from the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.POST/program/_code"></a>

#### adminRouter.POST/program/:code()
Creates a program in the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.PUT/program/_code"></a>

#### adminRouter.PUT/program/:code()
Updates a program in the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.DELETE/program/_code"></a>

#### adminRouter.DELETE/program/:code()
Deletes a program from the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/careers"></a>

#### adminRouter.GET/careers()
Retrieves all careers in database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/career/_code"></a>

#### adminRouter.GET/career/:code()
Retrieves a single career from the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.POST/career/_code"></a>

#### adminRouter.POST/career/:code()
Creates a career in the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.PUT/career/_code"></a>

#### adminRouter.PUT/career/:code()
Updates a career in the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.DELETE/career/_code"></a>

#### adminRouter.DELETE/career/:code()
Deletes a career from the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/courses"></a>

#### adminRouter.GET/courses()
Retrieves all courses in database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.GET/course/_code"></a>

#### adminRouter.GET/course/:code()
Retrieves a single course from the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.POST/course/_code"></a>

#### adminRouter.POST/course/:code()
Creates a course in the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.PUT/course/_code"></a>

#### adminRouter.PUT/course/:code()
Updates a course in the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes/admin..adminRouter.DELETE/course/_code"></a>

#### adminRouter.DELETE/course/:code()
Deletes a course from the database.

**Kind**: static method of [<code>adminRouter</code>](#module_routes/admin..adminRouter)  
<a name="module_routes"></a>

## routes
**Requires**: [<code>routes/admin</code>](#module_routes/admin), [<code>routes/search</code>](#module_routes/search)  
**Author**: Devon Rojas  
<a name="module_routes/search"></a>

## routes/search
**Requires**: <code>{@link https://www.npmjs.com/package/express\| express}</code>, <code>module:engine/search</code>  
**Author**: Devon Rojas  

* [routes/search](#module_routes/search)
    * [~searchRouter](#module_routes/search..searchRouter) : <code>object</code>
        * [.GET/()](#module_routes/search..searchRouter.GET/)
        * [.GET/programs(q)](#module_routes/search..searchRouter.GET/programs)
        * [.GET/courses(q)](#module_routes/search..searchRouter.GET/courses)
        * [.GET/careers(q)](#module_routes/search..searchRouter.GET/careers)

<a name="module_routes/search..searchRouter"></a>

### routes/search~searchRouter : <code>object</code>
**Kind**: inner namespace of [<code>routes/search</code>](#module_routes/search)  

* [~searchRouter](#module_routes/search..searchRouter) : <code>object</code>
    * [.GET/()](#module_routes/search..searchRouter.GET/)
    * [.GET/programs(q)](#module_routes/search..searchRouter.GET/programs)
    * [.GET/courses(q)](#module_routes/search..searchRouter.GET/courses)
    * [.GET/careers(q)](#module_routes/search..searchRouter.GET/careers)

<a name="module_routes/search..searchRouter.GET/"></a>

#### searchRouter.GET/()
Displays the routes of /search

**Kind**: static method of [<code>searchRouter</code>](#module_routes/search..searchRouter)  
<a name="module_routes/search..searchRouter.GET/programs"></a>

#### searchRouter.GET/programs(q)
Searches programs with query string.

**Kind**: static method of [<code>searchRouter</code>](#module_routes/search..searchRouter)  

| Param | Type | Description |
| --- | --- | --- |
| q | <code>string</code> | A string to query the Programs Search Engine with. |

**Example**  
```js
// /programs?q=[query string]
```
<a name="module_routes/search..searchRouter.GET/courses"></a>

#### searchRouter.GET/courses(q)
Searches courses with query string.

**Kind**: static method of [<code>searchRouter</code>](#module_routes/search..searchRouter)  

| Param | Type | Description |
| --- | --- | --- |
| q | <code>string</code> | A string to query the Courses Search Engine with. |

**Example**  
```js
// /courses?q=[query string]
```
<a name="module_routes/search..searchRouter.GET/careers"></a>

#### searchRouter.GET/careers(q)
Searches careers with query string.

**Kind**: static method of [<code>searchRouter</code>](#module_routes/search..searchRouter)  

| Param | Type | Description |
| --- | --- | --- |
| q | <code>string</code> | A string to query the Careers Search Engine with. |

**Example**  
```js
// /careers?q=[query string]
```
