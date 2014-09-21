describe("util.object",function(){var a;beforeEach(function(){a={a:{b:"B",c:{d:"D"}},e:{f:"F"}}});afterEach(function(){a=null});it("should identify an object",function(){expect(util.object.isObject(a)).toBe(!0);expect(util.object.isObject([])).toBe(!1);expect(util.object.isObject(!0)).toBe(!1);expect(util.object.isObject(null)).toBe(!1);expect(util.object.isObject(void 0)).toBe(!1);expect(util.object.isObject(3)).toBe(!1)});it("should resolve deeply nested key paths",function(){expect(util.object.resolve(a,
"a.b")).toEqual("B");expect(util.object.resolve(a,"a.c.d")).toEqual("D");expect(util.object.resolve(a,"e.f")).toEqual("F")});it("should resolve and set deeply nested key paths",function(){var a={};util.object.resolveAndSet(a,"a.b.c.g.h","H");util.object.resolveAndSet(a,"e.f.i.j","J");expect(a.a.b.c.g.h).toEqual("H");expect(a.e.f.i.j).toEqual("J")})});describe("util.structs",function(){var a,b,c;beforeEach(function(){b=new util.structs.ListItem("prev");c=new util.structs.ListItem("next")});afterEach(function(){a=b=c=null});it("should instantiate a sole ListItem",function(){a=new util.structs.ListItem("current");expect(a.data).toEqual("current");expect(a.previous).toEqual(null);expect(a.next).toEqual(null)});it("should instantiate a ListItem after an item",function(){a=new util.structs.ListItem("current",b);expect(a.data).toEqual("current");expect(a.previous).toEqual(b);
expect(a.next).toEqual(null);expect(b.next).toEqual(a);expect(b.previous).toEqual(null)});it("should instantiate a ListItem before an item",function(){a=new util.structs.ListItem("current",null,c);expect(a.data).toEqual("current");expect(a.previous).toEqual(null);expect(a.next).toEqual(c);expect(c.previous).toEqual(a);expect(c.next).toEqual(null)});it("should instantiate a ListItem between two items",function(){a=new util.structs.ListItem("current",b,c);expect(a.data).toEqual("current");expect(a.previous).toEqual(b);
expect(a.next).toEqual(c);expect(b.next).toEqual(a);expect(b.previous).toEqual(null);expect(c.previous).toEqual(a);expect(c.next).toEqual(null)})});describe("util.url",function(){var a,b;beforeEach(function(){a={a:"b",c:2,d:"the yellow brick road",e:!0};b={base:"http://google.com",qs:"a=b&c=2&d=the%20yellow%20brick%20road&e=true",full:"http://google.com?a=b&c=2&d=the%20yellow%20brick%20road&e=true"}});afterEach(function(){a=b=null});it("should append URL params",function(){expect(util.url.addParams("http://google.com",a)).toEqual(b.full);expect(util.url.addParams("http://google.com?f=f",a)).toEqual(b.base+"?f=f&"+b.qs)});it("should parse URL parameters",
function(){expect(util.url.parseParams(b.full)).toEqual(a);expect(util.url.parseParams(b.base)).toEqual({})});it("should parse a URL into an object",function(){expect(util.url.parse(b.full)).toEqual({protocol:"http",hostname:"google.com",port:80,path:"",url:b.full,params:a});expect(util.url.parse(b.base)).toEqual({protocol:"http",hostname:"google.com",port:80,path:"",url:b.base,params:{}});expect(util.url.parse(b.qs)).toEqual({protocol:"",hostname:"",port:"",path:"",url:b.qs,params:a})});it("should join URL fragments, resolving relative directories",
function(){expect(util.url.join("a","b","c")).toEqual("a/b/c");expect(util.url.join("a/","b","c")).toEqual("a/b/c");expect(util.url.join("/a","b","c")).toEqual("/a/b/c");expect(util.url.join("a","./b","c")).toEqual("a/b/c");expect(util.url.join("a",".b","c/")).toEqual("a/.b/c");expect(util.url.join("a","../b","c")).toEqual("b/c");expect(util.url.join("a","b","../c")).toEqual("a/c");expect(util.url.join("a","/b","c")).toEqual("a/c");expect(util.url.join("a","b","/c")).toEqual("a/b")})});
