'use strict';

import { combineReducers }  from 'redux';
import common               from './common';
import modal                from './modal';
import auth                 from './auth';
import users                from './users';
import ugo                  from './ugo';

export default combineReducers({ common, auth, users, ugo, modal });