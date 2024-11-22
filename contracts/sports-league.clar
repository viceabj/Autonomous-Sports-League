;; Decentralized Autonomous Sports League

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-exists (err u103))
(define-constant err-invalid-value (err u104))
(define-constant err-insufficient-funds (err u105))

;; Data Maps
(define-map teams
  { team-id: uint }
  {
    name: (string-ascii 50),
    owner: principal,
    balance: uint,
    players: (list 25 uint)
  }
)

(define-map players
  { player-id: uint }
  {
    name: (string-ascii 50),
    team-id: (optional uint),
    value: uint
  }
)

(define-map matches
  { match-id: uint }
  {
    home-team: uint,
    away-team: uint,
    date: uint,
    home-score: (optional uint),
    away-score: (optional uint),
    status: (string-ascii 20)
  }
)

;; Variables
(define-data-var last-team-id uint u0)
(define-data-var last-player-id uint u0)
(define-data-var last-match-id uint u0)

;; Private Functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner)
)

;; Public Functions
(define-public (create-team (name (string-ascii 50)))
  (let
    (
      (new-team-id (+ (var-get last-team-id) u1))
    )
    (map-set teams
      { team-id: new-team-id }
      {
        name: name,
        owner: tx-sender,
        balance: u0,
        players: (list)
      }
    )
    (var-set last-team-id new-team-id)
    (ok new-team-id)
  )
)

(define-public (add-player (name (string-ascii 50)) (value uint))
  (let
    (
      (new-player-id (+ (var-get last-player-id) u1))
    )
    (asserts! (is-owner) err-owner-only)
    (map-set players
      { player-id: new-player-id }
      {
        name: name,
        team-id: none,
        value: value
      }
    )
    (var-set last-player-id new-player-id)
    (ok new-player-id)
  )
)

(define-public (trade-player (player-id uint) (from-team-id uint) (to-team-id uint) (price uint))
  (let
    (
      (player (unwrap! (map-get? players { player-id: player-id }) err-not-found))
      (from-team (unwrap! (map-get? teams { team-id: from-team-id }) err-not-found))
      (to-team (unwrap! (map-get? teams { team-id: to-team-id }) err-not-found))
    )
    (asserts! (is-eq (some from-team-id) (get team-id player)) err-unauthorized)
    (asserts! (is-eq tx-sender (get owner from-team)) err-unauthorized)
    (asserts! (>= (get balance to-team) price) err-insufficient-funds)

    ;; Update player
    (map-set players { player-id: player-id }
      (merge player { team-id: (some to-team-id) }))

    ;; Update from-team (simplified, not removing player from list)
    (map-set teams { team-id: from-team-id }
      (merge from-team { balance: (+ (get balance from-team) price) }))

    ;; Update to-team (simplified, not adding player to list)
    (map-set teams { team-id: to-team-id }
      (merge to-team { balance: (- (get balance to-team) price) }))

    (ok true)
  )
)

(define-public (schedule-match (home-team-id uint) (away-team-id uint) (date uint))
  (let
    (
      (new-match-id (+ (var-get last-match-id) u1))
    )
    (asserts! (is-owner) err-owner-only)
    (asserts! (not (is-eq home-team-id away-team-id)) err-invalid-value)
    (map-set matches
      { match-id: new-match-id }
      {
        home-team: home-team-id,
        away-team: away-team-id,
        date: date,
        home-score: none,
        away-score: none,
        status: "scheduled"
      }
    )
    (var-set last-match-id new-match-id)
    (ok new-match-id)
  )
)

(define-public (report-match-result (match-id uint) (home-score uint) (away-score uint))
  (let
    (
      (match (unwrap! (map-get? matches { match-id: match-id }) err-not-found))
    )
    (asserts! (is-owner) err-owner-only)
    (asserts! (is-eq (get status match) "scheduled") err-invalid-value)
    (map-set matches
      { match-id: match-id }
      (merge match
        {
          home-score: (some home-score),
          away-score: (some away-score),
          status: "completed"
        }
      )
    )
    (ok true)
  )
)

(define-public (withdraw-balance (team-id uint) (amount uint))
  (let
    (
      (team (unwrap! (map-get? teams { team-id: team-id }) err-not-found))
    )
    (asserts! (is-eq tx-sender (get owner team)) err-unauthorized)
    (asserts! (>= (get balance team) amount) err-insufficient-funds)
    (try! (as-contract (stx-transfer? amount tx-sender (get owner team))))
    (map-set teams
      { team-id: team-id }
      (merge team { balance: (- (get balance team) amount) })
    )
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-team (team-id uint))
  (map-get? teams { team-id: team-id })
)

(define-read-only (get-player (player-id uint))
  (map-get? players { player-id: player-id })
)

(define-read-only (get-match (match-id uint))
  (map-get? matches { match-id: match-id })
)

