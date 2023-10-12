Feature: Court lock

  Background:
    Given I am on FACT homepage '/'
    Then I am logged out if I am an admin user
    Then I am logged out if I am a super admin
    And I am on the admin portal sign in page

  Scenario: Court lock error should display if two users are trying to edit same court at the same time
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    # making this step fail for retry testing
    When I click edit next to court with "evesham-county-court"
    When I click the Logout link
    Then the system will log me out
    Then I wait for log out to finish
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "evesham-county-court"
    Then An error is displayed for court lock with title "There is a problem" and summery "Evesham County Court is currently in use by hmcts.fact@gmail.com. Please contact them to finish their changes, or try again later."
