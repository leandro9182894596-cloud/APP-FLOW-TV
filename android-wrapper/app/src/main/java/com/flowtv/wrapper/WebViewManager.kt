package com.flowtv.wrapper

import android.annotation.SuppressLint
import android.content.Context
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView

object WebViewManager {
    @SuppressLint("SetJavaScriptEnabled")
    fun configureWebView(webView: WebView, context: Context) {
        // Configurar CookieManager - Garantir persistência
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true)
        }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = false // Segurança: Desabilitar acesso a arquivos locais
            allowContentAccess = true
            loadsImagesAutomatically = true
            mediaPlaybackRequiresUserGesture = false
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
            builtInZoomControls = false
            displayZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            setGeolocationEnabled(true)
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            loadWithOverviewMode = true
            useWideViewPort = true

            // User Agent para Android TV
            val originalUserAgent = userAgentString
            userAgentString = "$originalUserAgent AndroidTV"
        }
    }
}
