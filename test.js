const errorMsg = "Quota exceeded for quota metric 'Requests' and limit 'Requests per minute' of service 'mybusinessaccountmanagement.googleapis.com' for consumer 'project_number:763259258045'";
if (429 === 429 || errorMsg.includes("Quota")) {
  console.log("TRUE");
} else {
  console.log("FALSE");
}
