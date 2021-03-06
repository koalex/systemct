'use strict';

import { combineReducers }  from 'redux';
import common               from './common';
import modal                from './modal';
import auth                 from './auth';
import users                from './users';
import ugo                  from './ugo';
import sensors              from './sensors';
import devices              from './devices';
import projects             from './projects';
import changelog            from './changelog';
import charts               from './charts';

export default combineReducers({ common, auth, users, ugo, sensors, devices, projects, modal, changelog, charts });