package com.flowtv.wrapper

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView

class DeviceSelectionActivity : AppCompatActivity() {

    private lateinit var devicePreference: DevicePreference
    private lateinit var ivLogo: ImageView
    private lateinit var tvTitle: TextView
    private lateinit var tvSubtitle: TextView
    private lateinit var cardMobile: MaterialCardView
    private lateinit var cardTv: MaterialCardView
    private lateinit var btnContinue: MaterialButton
    private var selectedDeviceType: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_device_selection)

        initViews()
        devicePreference = DevicePreference(this)

        // Detectar dispositivo e pré-selecionar
        if (DeviceDetector.isTvDevice(this)) {
            selectDevice(Constants.DEVICE_TYPE_TV)
        } else {
            selectDevice(Constants.DEVICE_TYPE_MOBILE)
        }

        setupListeners()
        startAnimations()
    }

    private fun initViews() {
        ivLogo = findViewById(R.id.ivLogo)
        tvTitle = findViewById(R.id.tvTitle)
        tvSubtitle = findViewById(R.id.tvSubtitle)
        cardMobile = findViewById(R.id.cardMobile)
        cardTv = findViewById(R.id.cardTv)
        btnContinue = findViewById(R.id.btnContinue)
    }

    private fun setupListeners() {
        cardMobile.setOnClickListener {
            selectDevice(Constants.DEVICE_TYPE_MOBILE)
        }

        cardTv.setOnClickListener {
            selectDevice(Constants.DEVICE_TYPE_TV)
        }

        // Listener para foco nos cards
        cardMobile.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                ViewCompat.animate(cardMobile)
                    .scaleX(1.05f)
                    .scaleY(1.05f)
                    .setDuration(200)
                    .setInterpolator(AccelerateDecelerateInterpolator())
                    .start()
                cardMobile.cardElevation = 12f
            } else {
                if (selectedDeviceType != Constants.DEVICE_TYPE_MOBILE) {
                    ViewCompat.animate(cardMobile)
                        .scaleX(1f)
                        .scaleY(1f)
                        .setDuration(200)
                        .setInterpolator(AccelerateDecelerateInterpolator())
                        .start()
                    cardMobile.cardElevation = 0f
                } else {
                    ViewCompat.animate(cardMobile)
                        .scaleX(1f)
                        .scaleY(1f)
                        .setDuration(200)
                        .setInterpolator(AccelerateDecelerateInterpolator())
                        .start()
                }
            }
        }

        cardTv.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                ViewCompat.animate(cardTv)
                    .scaleX(1.05f)
                    .scaleY(1.05f)
                    .setDuration(200)
                    .setInterpolator(AccelerateDecelerateInterpolator())
                    .start()
                cardTv.cardElevation = 12f
            } else {
                if (selectedDeviceType != Constants.DEVICE_TYPE_TV) {
                    ViewCompat.animate(cardTv)
                        .scaleX(1f)
                        .scaleY(1f)
                        .setDuration(200)
                        .setInterpolator(AccelerateDecelerateInterpolator())
                        .start()
                    cardTv.cardElevation = 0f
                } else {
                    ViewCompat.animate(cardTv)
                        .scaleX(1f)
                        .scaleY(1f)
                        .setDuration(200)
                        .setInterpolator(AccelerateDecelerateInterpolator())
                        .start()
                }
            }
        }

        btnContinue.setOnClickListener {
            selectedDeviceType?.let { type ->
                devicePreference.setDeviceType(type)
                if (type == Constants.DEVICE_TYPE_MOBILE) {
                    NavigationManager.navigateToMainActivity(this)
                } else {
                    NavigationManager.navigateToTvWebViewActivity(this)
                }
                finish()
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
        }
    }

    private fun selectDevice(deviceType: String) {
        selectedDeviceType = deviceType
        btnContinue.isEnabled = true

        // Resetar cards
        cardMobile.strokeWidth = 0
        cardMobile.cardElevation = 0f
        cardTv.strokeWidth = 0
        cardTv.cardElevation = 0f

        // Aplicar seleção
        when (deviceType) {
            Constants.DEVICE_TYPE_MOBILE -> {
                cardMobile.strokeWidth = 4
                cardMobile.setStrokeColor(android.graphics.Color.parseColor(Constants.PRIMARY_COLOR))
                cardMobile.cardElevation = 8f
            }
            Constants.DEVICE_TYPE_TV -> {
                cardTv.strokeWidth = 4
                cardTv.setStrokeColor(android.graphics.Color.parseColor(Constants.PRIMARY_COLOR))
                cardTv.cardElevation = 8f
            }
        }

        // Animação de seleção
        val selectedCard = if (deviceType == Constants.DEVICE_TYPE_MOBILE) cardMobile else cardTv
        ViewCompat.animate(selectedCard)
            .scaleX(1.02f)
            .scaleY(1.02f)
            .setDuration(150)
            .withEndAction {
                ViewCompat.animate(selectedCard)
                    .scaleX(1f)
                    .scaleY(1f)
                    .setDuration(150)
                    .start()
            }
            .start()
    }

    private fun startAnimations() {
        val handler = Handler(Looper.getMainLooper())
        
        // Animação da logo
        handler.postDelayed({
            ViewCompat.animate(ivLogo)
                .alpha(1f)
                .translationY(0f)
                .setDuration(400)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .start()
        }, 100)

        // Animação do título
        handler.postDelayed({
            ViewCompat.animate(tvTitle)
                .alpha(1f)
                .translationY(0f)
                .setDuration(400)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .start()
        }, 200)

        // Animação do subtítulo
        handler.postDelayed({
            ViewCompat.animate(tvSubtitle)
                .alpha(1f)
                .translationY(0f)
                .setDuration(400)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .start()
        }, 300)

        // Animação dos cards
        handler.postDelayed({
            ViewCompat.animate(cardMobile)
                .alpha(1f)
                .translationX(0f)
                .setDuration(500)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .start()

            ViewCompat.animate(cardTv)
                .alpha(1f)
                .translationX(0f)
                .setDuration(500)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .start()
        }, 400)

        // Animação do botão
        handler.postDelayed({
            ViewCompat.animate(btnContinue)
                .alpha(1f)
                .setDuration(300)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .start()
        }, 500)
    }
}
