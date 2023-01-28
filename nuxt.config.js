export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,
    target: 'static',

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'IT-Quizz | Final Project',
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' },
            { name: 'format-detection', content: 'telephone=no' },
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['static/assets/css/main.css'],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: ['@nuxtjs/moment'],

    moment: {
        defaultLocale: 'th',
    },

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/bootstrap
        'bootstrap-vue/nuxt',
        // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        '@nuxtjs/auth-next',
        '@nuxtjs/recaptcha',
        'nuxt-sweetalert2',
    ],

    recaptcha: {
        hideBadge: false,
        language: 'th',
        siteKey: '6LdDecYUAAAAAJKnoZHwb0XpaRyBrUBx-meXpNBM',
        version: 2,
        size: 'normal',
    },

    auth: {
        strategies: {
            local: {
                endpoints: {
                    login: {
                        url: 'auth',
                        method: 'post',
                        propertyName: false,
                    },
                    user: {
                        url: 'user/profile',
                        method: 'get',
                        propertyName: false,
                    },
                    logout: false,
                },
                user: {
                    autoFetch: true,
                },
            },
        },
        redirect: {
            login: '/',
        },
    },

    publicRuntimeConfig: {
        API_URL: 'http://localhost:5000/',
    },

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {
        baseURL: 'http://localhost:5000/',
        credentials: false,
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {},
}