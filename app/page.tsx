export default function Home() {
    return (
        <main style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>

            {/* NAVBAR */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "60px" }}>
                <h2>Runway</h2>
                <button className="btn-primary">Get Started</button>
            </div>

            {/* HERO */}
            <div style={{ marginBottom: "80px" }}>
                <p className="subtle">ZERO-CLUTTER FINANCIAL FORECASTER</p>

                <h1 className="heading">
                    Know your <br />
                    <span style={{ fontStyle: "italic", fontWeight: 400 }}>exact</span> runway. <br />
                    Nothing else.
                </h1>

                <p className="subtle" style={{ marginTop: "20px" }}>
                    Drop messy bank data. Get your safe-to-spend daily limit for the next 30 days.
                </p>

                <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
                    <button className="btn-primary">Upload CSV</button>
                    <button className="btn-outline">See how it works</button>
                </div>
            </div>

            {/* UPLOAD BOX */}
            <div className="upload-box" style={{ marginBottom: "80px" }}>
                <h3>Drop transaction file here</h3>
                <p className="subtle">CSV or JSON from any bank</p>
            </div>

            {/* RESULT SECTION */}
            <div style={{ marginBottom: "60px" }}>
                <p className="subtle">30-DAY RUNWAY</p>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="big-number">₹847</span>
                    <span className="subtle">/day safe-to-spend</span>
                </div>

                <p className="subtle" style={{ marginTop: "10px" }}>
                    Next 30 days. Updated now. <span style={{ color: "green" }}>+₹62 vs last month</span>
                </p>
            </div>

            {/* STATS */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "60px" }}>
                <div className="card">
                    <p className="subtle">total out</p>
                    <h2 style={{ color: "red" }}>-₹38,420</h2>
                </div>

                <div className="card">
                    <p className="subtle">total in</p>
                    <h2 style={{ color: "green" }}>+₹82,000</h2>
                </div>

                <div className="card">
                    <p className="subtle">balance</p>
                    <h2>₹25,410</h2>
                </div>
            </div>

        </main>
    );
}