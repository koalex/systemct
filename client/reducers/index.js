'use strict';

import { combineReducers }  from 'redux';
import common               from './common';
import modal                from './modal';
import auth                 from './auth';
import users                from './users';
import ugo                  from './ugo';
import sensors              from './sensors';
import devices              from './devices';

export default combineReducers({ common, auth, users, ugo, sensors, devices, modal });