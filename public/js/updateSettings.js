// updateData
import axios from "axios";
import { showAlert } from "./alert";
export const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "http://127.0.0.1:3000/api/v1/users/updateMe",
      data: {
        name,
        email,
      },
    });
    console.log("triggered");
    if (res.data.status === "success") {
      showAlert("success", "You have successfully changed your information!");
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
