export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid Credential Error");
    this.name = "InvalidCredentialsError";
  }
}
