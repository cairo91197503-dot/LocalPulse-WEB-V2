const errorMsg = "Quota exceeded for quota metric 'Requests' and limit 'Requests per minute' of service 'mybusinessaccountmanagement.googleapis.com' for consumer 'project_number:763259258045'";

console.log("errorMsg includes Quota:", errorMsg.includes("Quota"));
console.log("status == 429:", 429 === 429);

if (429 === 429 || errorMsg.includes("Quota")) {
    console.log("Would enter IF");
} else {
    console.log("Would enter ELSE and throw");
}
