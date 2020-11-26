Feature: Bulk update of court info

  Background: Log in
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.super.fact@gmail.com" "Pa55word11"
    And click the Sign In button
    Then I can view the courts or tribunals in a list format

  Scenario: Edit information
    When I click bulk update
    Then I am on the "Bulk edit of additional information" page
    When I add an "Additional Information" in the field provided "#info"
    And I select court "aberdare-county-court"
    And I click the update button
    Then a message is displayed on the page
