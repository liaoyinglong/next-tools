function App() {
    return <NumberInput prefix={enableInternalIsMarket ? <TradeDropdown value={internalIsMarket}/> : t("Price")}/>;
}
