import React from "react";
import { Dimensions } from "react-native";
import { WebView } from "react-native-webview";

type TradingViewWidgetNativeProps = {
  symbol?: string;
};

export default function TradingViewWidgetNative({ symbol = "BITSTAMP:BTCUSD" }: TradingViewWidgetNativeProps) {
  const { width } = Dimensions.get("window");
  const height = 610; // Höhe ggf. anpassen

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          html, body { margin:0; padding:0; height: 100%; overflow: hidden; }
        </style>
      </head>
      <body>
        <div class="tradingview-widget-container" style="height: 100%; width: 100%;">
          <div class="tradingview-widget-container__widget" style="height: calc(100% - 32px); width: 100%;"></div>
          <div class="tradingview-widget-copyright">
            <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
              <span class="blue-text">Track all markets on TradingView</span>
            </a>
          </div>
        </div>
        <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "withdateranges": true,
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      style={{ width, height }}
      javaScriptEnabled={true} // JavaScript aktivieren
      domStorageEnabled={true}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView error: ", nativeEvent);
      }}
      onLoadEnd={() => console.log("WebView finished loading")}
    />
  );
}
