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
* `route` - puts new route in routes folder. That can be put like an interihance `route/page1/page2`
* `partial` - puts new partial and it's files in `partials/` folder
* `service` - puts new service and it's files in `common/` folder
* `directive` - puts new directive and it's files in `common/` folder
* `filter` - puts new filter and it's files in `common/` folder
* `config` - puts new config and it's files in `common/` folder

---

For deleting the instance **Grunt** will work with same way

    $ grunt delete:<type>:<route/name>