var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var _ = require('lodash');
var handlebars = require('handlebars');
var zproxy = require('./zproxy');
var config = require('./config');

var SearchFormView = require('./views/searchForm');
var SourcesListView = require('./views/sourceList');
var results = require('./views/results');

var sourcesCollection = new Backbone.Collection([
  {
    title: 'СПбГПУ'
  },
  {
    title: 'Томск'
  },
  {
    title: 'Арбикон'
  }
]);


var AppLayout = Marionette.LayoutView.extend({
  template: require('./templates/app_layout.hbs'),
  regions: {
    searchFormRegion: '.search_form_region',
    sourcesListRegion: '.sources_list_region',
    resultsRegion: '.results_region'
  },
  onShow: function () {
    var sourcesListView = new SourcesListView({
      collection: sourcesCollection
    });

    var searchFormView = new SearchFormView({});
    var resultsLayout = new results.ResultsLayout({});

    this.listenTo(searchFormView, 'submit', function (values) {
      console.log('send search form', values);
      var params = _.extend({
        host: 'ruslan.ru',
        base: 'books',
        rpn: handlebars.compile('@attr 1={{ attr }} "{{ value }}"')({
          attr: values.attr[0],
          value: values.value[0]
        })
      }, values);
      var deferredResults = zproxy.search({
        url: config.zproxy.searchUrl,
        params: params
      });
      deferredResults.done(function (searchResponse) {
        var recordModels = [];
        _.each(searchResponse.records, function (record) {
          recordModels.push({record: record});
        });
        var resultsCollectionView = new results.ResultsCollectionView({
          collection: new Backbone.Collection(recordModels)
        });
        resultsLayout.listRegion.show(resultsCollectionView);

      }).fail(function (error) {
        console.log('search error', error);
      });
    });

    this.searchFormRegion.show(searchFormView);
    this.sourcesListRegion.show(sourcesListView);
    this.resultsRegion.show(resultsLayout);
  }
});

var start = function (containerSelector) {
  var MyApp = new Marionette.Application();
  MyApp.addRegions({
    mainRegion: containerSelector
  });

  MyApp.mainRegion.show(new AppLayout());
};

module.exports = start;






