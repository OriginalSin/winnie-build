var nsGmx = window.nsGmx = window.nsGmx || {};nsGmx.Templates = nsGmx.Templates || {};nsGmx.Templates.AuthWidget = {};
nsGmx.Templates.AuthWidget["authWidget"] = "{{#if userName}}\n" +
    "    <div class=\"authWidget_authorized\">\n" +
    "        <div class=\"authWidget-userPanel\">\n" +
    "            <div class=\"authWidget-userPanel-iconCell\">\n" +
    "                <div class=\"authWidget-userPanel-userIcon\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"authWidget-userPanel-userMenuCell\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "{{else}}\n" +
    "    <div class=\"authWidget_unauthorized\">\n" +
    "        <div class=\"authWidget-loginButton\">\n" +
    "            {{i 'auth.login'}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "{{/if}}";;
var nsGmx = window.nsGmx = window.nsGmx || {};

nsGmx.AuthWidget = (function() {

    // options.loginDialog
    var AuthWidget = function(options) {
        this._view = $('<div>');
        this._view.addClass('authWidget ui-widget');
        this._authManager = options.authManager;
        this._userInfo = null;

        this._options = $.extend({
            showAccountLink: true,
            accountLink: 'http://my.kosmosnimki.ru/Home/Settings/',
            showMapLink: true
                /* mapLink */
        }, options);

        this._authManager.getUserInfo().then(function(response) {
            this._render({
                login: response.Result && response.Result.Login,
                userName: response.Result && (response.Result.FullName || response.Result.Nickname || response.Result.Login)
            });
            this._userInfo = response.Result;
            $(this).trigger('ready');
        }.bind(this)).fail(function(response) {
            this._render(response);
        }.bind(this));
    };

    AuthWidget.prototype._render = function(vm) {
        var self = this;

        this._view.html(Handlebars.compile(nsGmx.Templates.AuthWidget.authWidget)(vm));

        if (vm.userName) {
            var dropdownItems = [];

            if (this._options.showAccountLink) {
                dropdownItems.push({
                    title: nsGmx.Translations.getText('auth.myAccount'),
                    link: this._options.accountLink,
                    id: 'AuthWidgetAccountLink',
                    newWindow: true
                });
            }

            if (this._options.showMapLink) {
                var defaultMapLink = 'http://maps.kosmosnimki.ru/api/index.html?' + encodeURIComponent('@' + vm.login);
                dropdownItems.push({
                    title: nsGmx.Translations.getText('auth.myMap'),
                    link: this._options.mapLink || defaultMapLink,
                    id: 'AuthWidgetMapLink',
                    newWindow: true
                });
            }

            dropdownItems.push({
                title: nsGmx.Translations.getText('auth.logout'),
                className: 'authWidget-logoutButton'
            })

            var dropdownMenuWidget = new nsGmx.DropdownMenuWidget({
                items: [{
                    title: vm.userName,
                    dropdown: dropdownItems
                }]
            });

            dropdownMenuWidget.appendTo(this._view.find('.authWidget-userPanel-userMenuCell'));
        }

        this._view.find('.authWidget-loginButton').click(function(e) {
            var $iframeContainer;
            if (this._options.loginDialog) {
                $iframeContainer = $('<div>').addClass('authWidget-iframeContainer');
                var dialog = $iframeContainer.dialog({
                    width: 500,
                    height: 450,
                    closeText: nsGmx.Translations.getText('auth.closeDialog'),
                    close: function(je, ui) {
                        $(this).dialog('destroy');
                    }
                });
                // HACK:
                $(dialog).parent().find('button.ui-button').addClass('ui-icon').css('outline', 'none')
            }

            this._authManager.login({
                iframeContainer: $iframeContainer && $iframeContainer[0]
            });
        }.bind(this));


        this._view.find('.authWidget-logoutButton').click(function(e) {
            this._authManager.logout().then(function(response) {
                this._render(response);
                this._userInfo = response.Result;
                $(this).trigger('logout');
            }.bind(this));
        }.bind(this));
    };

    /** Получить информацию о пользователе, которую вернул AuthManager
     * @return {Object}
     */
    AuthWidget.prototype.getUserInfo = function() {
        return this._userInfo;
    };

    AuthWidget.prototype.on = function(eventName, callback) {
        $(this).on(eventName, callback);
    };

    AuthWidget.prototype.appendTo = function(placeholder) {
        placeholder.append(this._view);
    };

    return AuthWidget;
})();
;
var nsGmx = window.nsGmx;

nsGmx.Translations.addText('rus', {
	auth: {
		'login': 'Войти',
		'logout': 'Выйти',
		'myAccount': 'Личный кабинет',
		'myMap': 'Личная карта',
		'closeDialog': 'Закрыть'
	}
});

nsGmx.Translations.addText('eng', {
	auth: {
		'login': 'Login',
		'logout': 'Logout',
		'myAccount': 'My account',
		'myMap': 'My map',
		'closeDialog': 'Close'
	}
});
;