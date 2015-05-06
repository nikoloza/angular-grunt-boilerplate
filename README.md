# Angular Boilerplate

To setup project node dependencies, you need to run:

    $ npm install

---

To create new app you need to run following:

    $ grunt create:app:<appname>

---

Creating of new instance could be:

    $ grunt create:<type>:<route/name>


`types` can be:

* `app` - generates app structure
* `route` - puts new route in routes folder
* `service` - puts new service in common/services folder
* `directive` - puts new directive in common/directives folder
* `partial` - puts new partial in common/partials folder
* `filter` - puts new filter in common/filters folder
* `config` - puts new config in common/configs folder

---

For deleting the instance **Grunt** will work with same way

    $ grunt delete:<type>:<route/name>