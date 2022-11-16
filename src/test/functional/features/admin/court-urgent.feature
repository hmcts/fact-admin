Feature: Court Update Urgent Message

  Background: View the list
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    #When I go to the courts page
    When I select Include closed courts
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario: Adding urgent notice English & Welsh
    When I click edit next to court with "administrative-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I add an "Urgent Notice" in the rich editor field provided "#generalInfoTab #urgent-notice"
    When I have added the "Welsh translation of the urgent notice" in the Urgent Notice Welsh field
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    Then I click the link view court in new tab to validate urgent notice label generated
