// updateData
import axios from "axios";
import { showAlert } from "./alert";

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updateMyPassword"
        : "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert(
        "success",
        `You have successfully changed your ${type.toUpperCase()}!`
      );
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
