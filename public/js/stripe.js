const stripe = Stripe(
  "pk_test_51PwpbrP3eb0vVZgiINOeVd6tTiAXFehmUczUDXndIISLDK81k6XHdp6o90CF4Bm3uhExSOD383l0sMmYYC5j1ixX00KPW9aRcU"
);
import axios from "axios";
import { showAlert } from "./alert";

export const bookTour = async (tourId) => {
  try {
    //1)Get checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    console.log(session);
    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert("error", error);
  }
};
