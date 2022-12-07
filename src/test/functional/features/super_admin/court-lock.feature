Feature: Court lock

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page

  Scenario: Court lock error should display if two users are trying to edit same court at the same time
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "evesham-county-court"
    When I click the Logout link
    Then the system will log me out
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "evesham-county-court"
    Then An error is displayed for court lock with title "There is a problem" and summery "evesham-county-court is currently in use by hmcts.super.fact@gmail.com. Please contact them to finish their changes, or try again later."
