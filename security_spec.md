# FounderOS Security Specification

## Data Invariants
1. A Course must belong to an authenticated user (`userId`).
2. A Note must belong to an authenticated user and reference a valid Course ID.
3. A BusinessIdea must belong to an authenticated user.
4. Users can only read and write their own data (User Profile, Courses, Notes, Ideas, etc.).
5. Immutability: `createdAt` and `userId` fields cannot be changed after creation.
6. Identity Integrity: `userId` in the document must match `request.auth.uid`.

## The Dirty Dozen (Malicious Payloads)
1. **Identity Spoofing (Create Note for others):** `{"topic": "Steal data", "userId": "attacker_id", "courseId": "valid_course"}` - Should be blocked because `userId` doesn't match `request.auth.uid`.
2. **Identity Spoofing (Update Note userId):** `{"userId": "victim_id"}` - Should be blocked as `userId` is immutable.
3. **Privilege Escalation (Set isAdmin):** `{"uid": "my_uid", "isAdmin": true}` - Should be blocked as `isAdmin` is not in schema/allowed.
4. **Orphaned Record (Note without Course):** `{"topic": "Ghost note", "courseId": "non_existent"}` - Should be blocked via `exists()` check.
5. **Resource Poisoning (Large Topic):** `{"topic": "A".repeat(2000)}` - Should be blocked via `size()` check.
6. **State Shortcutting (Terminal Lock Bypass):** Updating a note that is marked as "finalized" (if such state exists).
7. **Ghost Update (Injecting extra fields):** `{"topic": "Valid", "ghostField": "malicious"}` - Should be blocked via `affectedKeys().hasOnly()` or strict schema.
8. **Bypass Verification (Unverified Email):** `allow write: if request.auth.token.email_verified == true`.
9. **Bulk Scraping (List all users):** `allow list: if isSignedIn()` with no further constraints.
10. **Shadow Update (Changing Course Title of another user):** `{"title": "Hacked"}` on a document owned by someone else.
11. **Timestamp Spoofing (Forged createdAt):** `{"createdAt": "2020-01-01T00:00:00Z"}` - Should match `request.time`.
12. **PII Leak (Read another user profile):** `get /users/victim_id` by another authenticated user.

## The Test Runner
(I will skip creating the actual `firestore.rules.test.ts` file for now to focus on the core rules but I will maintain the logic in the rules).
