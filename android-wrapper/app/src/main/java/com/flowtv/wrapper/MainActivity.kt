package com.flowtv.wrapper

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.flowtv.wrapper.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var devicePreference: DevicePreference
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null
    private var webViewState: Bundle? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        devicePreference = DevicePreference(this)
        enableFullscreen()

        WebViewManager.configureWebView(binding.webView, this)

        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                if (view == null) return
                showCustomView(view, callback)
            }

            override fun onHideCustomView() {
                hideCustomView()
            }
        }

        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean = false
        }

        binding.webView.loadUrl(Constants.REMOTE_APP_URL)

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
        WindowInsetsControllerCompat(window, binding.root).let { controller ->
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    private fun showCustomView(view: View, callback: WebChromeClient.CustomViewCallback?) {
        val decor = window.decorView as FrameLayout
        if (customView != null) {
            callback?.onCustomViewHidden()
            return
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
        enableFullscreen()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_change_device -> {
                showChangeDeviceDialog()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun showChangeDeviceDialog() {
        AlertDialog.Builder(this)
            .setTitle(R.string.change_device_title)
            .setMessage(R.string.change_device_message)
            .setPositiveButton(R.string.yes) { _, _ ->
                devicePreference.clearDeviceType()
                NavigationManager.restartApp(this)
                finish()
            }
            .setNegativeButton(R.string.no, null)
            .show()
    }
}
