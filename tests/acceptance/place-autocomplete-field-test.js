/* jshint expr:true */
import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect, assert } from 'chai';
import Ember from 'ember';

import startApp from '../helpers/start-app';
import GooglePlaceAutocompleteResponseMock from './../helpers/google-place-autocomplete-response-mock';

describe('Acceptance : place autocomplete', function() {
  var application;

  beforeEach(function() {

    // Mock only google places
    window.google.maps.places = {
      Autocomplete() {
        return {
          addListener(event, f) {
            f.call();
          },
          getPlace() {
            return GooglePlaceAutocompleteResponseMock;
          }
        };
      }
    };
    application = startApp();

    // PhantomJS doesn't support bind yet
    // see https://github.com/ariya/phantomjs/issues/10522
    Function.prototype.bind = Function.prototype.bind || function (thisp) {
        let fn = this;
        return function() {
          return fn.apply(thisp, arguments);
        };
    };
  });

  afterEach(function() {
    Ember.run(application, 'destroy');
  });

  context('place_changed is fired', function(){
    it('renders options from google', function(){
      visit('/');
      andThen(() =>{
        expect(find('.place-autocomplete--input').length).to.equal(1);
      });
      andThen(() => {
        Ember.$('.place-autocomplete--input').val('Medellin');
        Ember.$('.place-autocomplete--input').trigger('plan_changed');
        andThen(() => {
          expect(Ember.$('.place-autocomplete--input').val(), 'Medellin');
          let timeOut = setTimeout(() => {
            assert(false, 'Event never fired');
          }, 1000);
          Ember.$('.place-autocomplete--input').on('plan_changed',() => {
            window.clearTimeout(timeOut);
            expect(Ember.$('.pac-container').length > 0).to.equal(true);
          });
        });
      });
    });

    it('event listener works as expected', function(){
      visit('/');
      andThen(() =>{
        expect(Ember.$('.place-autocomplete--input').val('El Poblado, Medellín - Antioquia, Colombia'));
        expect(Ember.$('div[data-google-auto="done"]').length, 1);
      });
    });
  });
});

