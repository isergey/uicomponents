$ = require('jquery')
Backbone = require('backbone')
Backbone.$ = $
Marionette = require('backbone.marionette')
_ = require('lodash')

Grid = require('./components/grid.coffee')

class Filter extends Marionette.ItemView
  template: require('./templates/filter.hbs')
  events:
    'change input': ->
      @trigger 'change', @$el.find('input').val()


class MainLayout extends Marionette.LayoutView
  template: require('./templates/main_layout.hbs')
  regions:
    filterRegion: '.filter'
    gridRegion: '.grid'

  initialize: ->
    console.log('Main layout consturct')

  onShow: ->
    collection = new Backbone.Collection([
      {
        id: '1'
        title: 'Война и мир'
      },
      {
        id: '2'
        title: 'Сказка о попе и его работнике Балде'
      }
    ])
    filterView = new Filter()
    gridView = new Grid({
      columns: [
        {
          id: 'title',
          label: 'Заглавие',
          sorted: true,
          initOrder: 'asc'
        }
      ],
      source: collection
    })
    filterView.on('change', (args) ->
      console.log(args)
    );


    @filterRegion.show(filterView)



App = new Marionette.Application()

App.addRegions({
  mainRegion: '.main_region'
})
App.start()
App.mainRegion.show(new MainLayout({}))
