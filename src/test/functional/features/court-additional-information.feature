Feature: Court Additional Information Message

  Background: View the list
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.super.fact@gmail.com" "Pa55word11"
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario: Additional Information
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I add an "Additional Information" in the rich editor field provided "#info"
    And I click the save button
    Then a success message is displayed on the tab

  Scenario: Welsh Translation
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I add an "Welsh translation of the additional information" in the rich editor field provided "#info_cy"
    And I click the save button
    Then a success message is displayed on the tab
