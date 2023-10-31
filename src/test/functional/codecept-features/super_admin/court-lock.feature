Feature: Court lock

  Scenario: Court lock error should display if two users are trying to edit same court at the same time
    When I log in as an admin
    When I select Include closed courts
    When I click edit next to court with "evesham-county-court"
    When I click the Logout link
    Then the system will log me out
    Then I wait for log out to finish
    When I log in as a super-admin
    When I select Include closed courts
    When I click edit next to court with "evesham-county-court"
    Then An error is displayed for court lock with title "There is a problem" and summery "Evesham County Court is currently in use by hmcts.fact@gmail.com. Please contact them to finish their changes, or try again later."
