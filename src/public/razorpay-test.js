const orderId = "order_ToxLsNab2NXvXu";
const keyId = "rzp_test_TowGsbfQjCdxX8";

console.log("Razorpay SDK:", typeof window.Razorpay);

document.getElementById("payButton").addEventListener("click", () => {
    if (typeof window.Razorpay !== "function") {
        alert("Razorpay SDK load nahi hui. Console check karo.");
        return;
    }

    const checkout = new window.Razorpay({
        key: keyId,
        amount: 249900,
        currency: "INR",
        name: "QuireHire",
        description: "GROWTH Plan Test Payment",
        order_id: orderId,

        handler(response) {
            console.log("Payment response:", response);
            alert("Payment response Console mein available hai.");
        },
    });

    checkout.open();
    
  
});
