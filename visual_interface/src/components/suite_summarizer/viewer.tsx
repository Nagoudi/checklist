//var widgets = require('@jupyter-widgets/base');
//var _ = require('lodash');
import * as widgets from '@jupyter-widgets/base';
import * as _ from 'lodash';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../../style.css';
import { RawTestCase, RawTestResult, RawTestStats } from '../../stores/Interface';
import { testStore } from '../../stores/tests/TestStore';
 

// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
export const Model = widgets.DOMWidgetModel.extend({
    defaults: _.extend(_.result(this, 'widgets.DOMWidgetModel.prototype.defaults'), {
    //defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'TestRateModel',
        _view_name : 'TestRateView',
        _model_module : 'viewer',
        _view_module : 'viewer',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
    })
});

// Custom View. Renders the widget model.
export const View = widgets.DOMWidgetView.extend({
    /*
    initialize: function() {
        const backbone = this;
        const $app = document.createElement("div");
        ReactDOM.render(<App />, $app);
        backbone.$el.append($app);
    },
    */
    // to get data from the backend
    onExistTestsChanged: function(): void {
        //rateStore.setTestsToRate(this.model.get("test_infos"));
        //if (redraw) { this.renderApp(); }
    },
    
    // to get data from the backend
    onSummarizerChanged: function(redraw: boolean=false): void {
        testStore.setTest(this.model.get("summarizer") as RawTestResult);
        //if (redraw) { this.renderApp(); }
    },
    onExampleChanged: function(redraw: boolean=false): void {     
        testStore.addMoreTestcases(this.model.get("testcases") as RawTestCase[]);
        //if (redraw) { this.renderApp(); }
    },
    onStatsChanged: function(redraw: boolean=false): void {
        testStore.setTestStats(this.model.get("stats") as RawTestStats);
    },

    onApplyFilter: function(): void {
        testStore.testcases = [];
        this.send({
            event: 'apply_filter', 
            filter_tags: testStore.searchTags, 
            filter_fail_case: testStore.failCaseOnly
        });
    },

    onFetchMoreExample: function(): void {
        this.send({ event: 'fetch_example' });
        //this.renderApp();
    },

    onSelectTest: function(testname: number): void {
        this.send({ event: 'switch_test', testname: testname });
        //this.renderApp();
    },


    renderApp: function() {
        if (document.getElementById("app-wrapper")) {
            document.getElementById("app-wrapper").remove();
        }
        const $app = document.createElement("div");
        $app.setAttribute("id", "app-wrapper");
        /*
        const wrapper = <TestRatePanel 
            onSwitchTest={this.onSwitchTest}
            onSubmit={this.onConfirmRate}
            onFetch={this.onFetchMoreExample}
            onSearch={this.onApplyFilter}/>
        */
       const wrapper = null;
        
        ReactDOM.render(wrapper, $app);
        this.el.appendChild($app);
    },

    render: function() {
        // bind functions
        this.onExistTestsChanged = this.onExistTestsChanged.bind(this);
        this.onSummarizerChanged = this.onSummarizerChanged.bind(this);
        this.onExampleChanged = this.onExampleChanged.bind(this);
        this.onStatsChanged = this.onStatsChanged.bind(this);

        this.onApplyFilter = this.onApplyFilter.bind(this);
        this.onFetchMoreExample = this.onFetchMoreExample.bind(this);
        this.onSelectTest = this.onSelectTest.bind(this);

        this.renderApp = this.renderApp.bind(this);
        // init the value
        this.onExistTestsChanged();
        this.onSelectTest();
        this.onSummarizerChanged(false);
        this.onExampleChanged(false);
        this.onStatsChanged(false);
        this.renderApp();

        // Python -> JavaScript update
        this.listenTo(this.model, 'change:test_infos', this.onExistTestsChanged, this);
        this.listenTo(this.model, 'change:summarizer', this.onSummarizerChanged, this);
        this.listenTo(this.model, 'change:testcases', this.onExampleChanged, this);
        this.listenTo(this.model, 'change:stats', this.onStatsChanged, this);
    }
});