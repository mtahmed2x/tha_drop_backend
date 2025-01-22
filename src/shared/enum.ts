export enum Role {
  GUEST = "GUEST",
  HOST = "HOST",
  DJ = "DJ",
  BARTENDER = "BARTENDER",
  BOTTLEGIRL = "BOTTLEGIRL",
  ADMIN = "ADMIN",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum RequestType {
  SENT = "SENT",
  RECIEVED = "RECIEVED",
}

export enum RequestStatus {
  ACCEPTED = "ACCEPTED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

export enum TransactionSubject {
  EVENT = "EVENT",
  TICKET = "TICKET",
  HIRING = "HIRING",
}

export enum NotificationType {
  TICKET = "TICKET",
  ACCOUNT = "ACCOUNT",
  REQUEST_REJECT = "REQUEST_REJECT",
  REQUEST_ACCEPT = "REQUEST_ACCEPT",
  RECIEVED_REQUEST = "RECIEVED_REQUEST",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILURE = "PAYMENT_FAILURE",
}
