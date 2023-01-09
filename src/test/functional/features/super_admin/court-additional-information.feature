Feature: Court Additional Information Message

  Background: View the list
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts

  Scenario: Adding additional info English and Welsh
    When I click edit next to court with "birmingham-civil-and-family-justice-centre"
    Then I am redirected to the Edit Court page for the chosen court
    When I add an "Additional Information test" in the rich editor field provided "#info"
    When I add an "Welsh translation of the additional information test" in the rich editor field provided "#info_cy"
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
