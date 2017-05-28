/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /* 
   ================================
   ===       USER FIXTURE      ====
   ================================ 
*/

'use strict';

module.exports = [
    {
        INIT: true,
        active: true,
        immortal: true,
        deleted: false,
        name: 'Суперпользователь',
        patronymic: 'Системный',
        surname: 'Системы',
        email: 'system@systemct.ru',
        password: 'system123',
        passwordConfirmation: 'system123',
        avatar: 'https://avatars3.githubusercontent.com/u/8536648?v=3&s=500',
        role: 'superuser',
        phone: '+73832278272',
        skype: 'NO_SKYPE',
        created_by: '584d39363c471d2bc61accad',
        last_updated_by: '584d39363c471d2bc61accad'
        /*accounts: {
            vk               : {
                id           : String,
                token        : String,
                email        : String,
                name         : String
            },
            facebook         : {
                id           : String,
                token        : String,
                email        : String,
                name         : String
            },
            twitter          : {
                id           : String,
                token        : String,
                displayName  : String,
                username     : String
            },
            google           : {
                id           : String,
                token        : String,
                email        : String,
                name         : String
            }
        },
        settings: { },
        push_id: { type: String },*/
    },
    {
        INIT: true,
        active: true,
        immortal: true,
        deleted: false,
        name: 'Администратор',
        patronymic: 'Системный',
        surname: 'Системы',
        email: 'admin@systemct.ru',
        password: 'admin123',
        passwordConfirmation: 'admin123',
        avatar: 'https://avatars3.githubusercontent.com/u/8536648?v=3&s=500',
        role: 'admin',
        phone: '+73832278272',
        skype: 'NO_SKYPE',
        created_by: '584d39363c471d2bc61accad',
        last_updated_by: '584d39363c471d2bc61accad'
    },
    {
        INIT: true,
        active: true,
        immortal: true,
        deleted: false,
        name: 'Пользователь',
        patronymic: 'Системный',
        surname: 'Системы',
        email: 'user@systemct.ru',
        password: 'user123',
        passwordConfirmation: 'user123',
        avatar: 'https://avatars3.githubusercontent.com/u/8536648?v=3&s=500',
        role: 'manager',
        phone: '+73832278272',
        skype: 'NO_SKYPE',
        created_by: '584d39363c471d2bc61accad',
        last_updated_by: '584d39363c471d2bc61accad'
    }
];