package com.flowtv.wrapper

import android.annotation.SuppressLint
import android.content.pm.ActivityInfo
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.flowtv.wrapper.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null
    private var originalOrientation: Int = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
    private var webViewState: Bundle? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        enableFullscreen()

        binding.webView.apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.setAppCacheEnabled(true)
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.loadsImagesAutomatically = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.setSupportMultipleWindows(false)
            
            // Melhorias de cache e desempenho
            settings.cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            
            // Service Worker e PWA
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(false)
            }
            
            webChromeClient = FlowWebChromeClient()
            webViewClient = FlowWebViewClient()
            
            // Restaurar estado se disponível
            if (savedInstanceState != null) {
                restoreState(savedInstanceState)
            }
            
            loadUrl(getString(R.string.remote_app_url))
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (customView != null) {
                    hideCustomView()
                } else if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        binding.webView.restoreState(savedInstanceState)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            enableFullscreen()
        }
    }

    override fun onResume() {
        super.onResume()
        binding.webView.onResume()
        webViewState?.let {
            binding.webView.restoreState(it)
        }
    }

    override fun onPause() {
        super.onPause()
        binding.webView.onPause()
        val state = Bundle()
        binding.webView.saveState(state)
        webViewState = state
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }

    private fun enableFullscreen() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, binding.root).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    private fun showCustomView(view: View, callback: WebChromeClient.CustomViewCallback?) {
        val decor = window.decorView as FrameLayout
        if (customView != null) {
            callback?.onCustomViewHidden()
            return
        }

        // Save original orientation and force landscape (apenas se não for TV)
        if (!isTvDevice()) {
            originalOrientation = requestedOrientation
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        }

        customView = view
        customViewCallback = callback
        binding.webView.visibility = View.GONE

        decor.addView(
            view,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        )
        enableFullscreen()
    }

    private fun hideCustomView() {
        val decor = window.decorView as FrameLayout
        customView?.let { decor.removeView(it) }
        customView = null
        binding.webView.visibility = View.VISIBLE
        customViewCallback?.onCustomViewHidden()
        customViewCallback = null
        
        // Restore original orientation (apenas se não for TV)
        if (!isTvDevice()) {
            requestedOrientation = originalOrientation
        }
        
        enableFullscreen()
    }
    
    // Verifica se é uma Android TV
    private fun isTvDevice(): Boolean {
        val uiModeManager = getSystemService(android.content.Context.UI_MODE_SERVICE) as android.app.UiModeManager
        return uiModeManager.currentModeType == android.content.res.Configuration.UI_MODE_TYPE_TELEVISION
    }

    private inner class FlowWebViewClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(
            view: WebView?,
            request: WebResourceRequest?
        ): Boolean = false

        // Habilitar cache para recursos estáticos
        override fun shouldInterceptRequest(
            view: WebView?,
            request: WebResourceRequest?
        ): android.webkit.WebResourceResponse? {
            return super.shouldInterceptRequest(view, request)
        }
    }

    private inner class FlowWebChromeClient : WebChromeClient() {
        override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
            if (view == null) return
            showCustomView(view, callback)
        }

        override fun onHideCustomView() {
            hideCustomView()
        }
    }
}
