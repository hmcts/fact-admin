Feature: Court Update Urgent Message

  Background:
    Given a court is created through the API
    When I am on FACT homepage '/'
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court

  Scenario: Adding urgent notice English & Welsh
    When I add an "Urgent Notice" in the rich editor field provided "#generalInfoTab #urgent-notice_ifr"
    When I have added the "Welsh translation of the urgent notice" in the Urgent Notice Welsh field
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    Then I click the link view court in new tab to validate urgent notice label generated
    And the court is cleaned up through the API
